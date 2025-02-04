"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import dynamic from "next/dynamic";
import { evaluate } from "mathjs";

// Import KaTeX CSS
import "katex/dist/katex.min.css";

const EnhancedMathInput = dynamic(
  () => import("@/components/enhanced-math-input"),
  {
    ssr: false,
    loading: () => (
      <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
    ),
  }
);

interface Agent {
  utilityFunction: string;
  endowment: {
    x: number;
    y: number;
  };
}

interface EdgeworthState {
  agent1: Agent;
  agent2: Agent;
  boxDimensions: {
    width: number;
    height: number;
  };
}

export default function EdgeworthBox() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<EdgeworthState>({
    agent1: {
      utilityFunction: "ln(x) + ln(y)",
      endowment: { x: 5, y: 10 },
    },
    agent2: {
      utilityFunction: "x * y",
      endowment: { x: 10, y: 5 },
    },
    boxDimensions: {
      width: 15,
      height: 15,
    },
  });

  // Update box dimensions when endowments change
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      boxDimensions: {
        width: prev.agent1.endowment.x + prev.agent2.endowment.x,
        height: prev.agent1.endowment.y + prev.agent2.endowment.y,
      },
    }));
  }, [state.agent1.endowment, state.agent2.endowment]);

  const evaluateUtility = (
    agent: Agent,
    x: number,
    y: number,
    isAgent2: boolean = false
  ) => {
    try {
      // For agent 2, transform coordinates to their perspective (from top-right)
      if (isAgent2) {
        x = state.boxDimensions.width - x;
        y = state.boxDimensions.height - y;
      }

      // Ensure values are positive
      if (x <= 0.001 || y <= 0.001) return 0;

      // Sanitize the utility function string
      const sanitizedFunction = agent.utilityFunction
        .replace(/ln/g, "log") // mathjs uses log instead of ln
        .trim();

      return evaluate(sanitizedFunction, { x, y });
    } catch {
      return 0;
    }
  };

  const handleEndowmentChange = (
    agent: "agent1" | "agent2",
    good: "x" | "y",
    value: string
  ) => {
    const numValue = Math.max(0.1, parseFloat(value) || 0.1);
    setState((prev) => ({
      ...prev,
      [agent]: {
        ...prev[agent],
        endowment: {
          ...prev[agent].endowment,
          [good]: numValue,
        },
      },
    }));
  };

  const findIndifferenceCurvePoints = (
    agent: Agent,
    utilityLevel: number,
    steps: number,
    isAgent2: boolean = false
  ) => {
    const points: [number, number][] = [];
    const width = state.boxDimensions.width;
    const height = state.boxDimensions.height;

    // Sample x values across the width of the box, including very close to edges
    for (let i = 0; i <= steps; i++) {
      const x = 0.001 + (i / steps) * (width - 0.002);

      try {
        // For any utility function U(x,y), an indifference curve has U(x,y) = k
        // Substitute x and solve for y
        const expr = agent.utilityFunction
          .replace(/ln/g, "log")
          // Help mathjs parse common expressions
          .replace(/(\d+)([xy])/g, "$1*$2") // Convert 2x to 2*x
          .replace(/([xy])(\d+)/g, "$1^$2") // Convert x2 to x^2
          .replace(/([xy])\^(\d+)\/(\d+)/g, "$1^($2/$3)") // Convert x^1/2 to x^(1/2)
          // Add explicit exponents where missing
          .replace(/([xy])(?![*+\-/^])/g, "$1^1") // Add ^1 to lone x or y
          .replace(/\*([xy])(?![*+\-/^])/g, "*$1^1") // Add ^1 after multiplication
          .trim();

        const y = evaluate(`solve(${expr} = ${utilityLevel}, y)`, { x });

        // y might be an array of solutions, take the positive one in our range
        const validY = Array.isArray(y)
          ? y.find((val) => val >= 0.001 && val <= height - 0.001)
          : y >= 0.001 && y <= height - 0.001
          ? y
          : null;

        if (validY !== null && isFinite(validY)) {
          // For agent 2, transform the point to their coordinate system (top-right origin)
          const point: [number, number] = isAgent2
            ? [width - x, height - validY]
            : [x, validY];
          points.push(point);
        }
      } catch {
        // If we can't solve algebraically, try numerical approximation
        try {
          // Binary search for y value that gives target utility
          let low = 0.001;
          let high = height - 0.001;
          const tolerance = 0.0001;
          let iterations = 0;
          const maxIterations = 40;

          while (iterations < maxIterations && high - low > tolerance) {
            const mid = (low + high) / 2;
            const u = evaluateUtility(agent, x, mid, false);

            if (Math.abs(u - utilityLevel) < tolerance) {
              const point: [number, number] = isAgent2
                ? [width - x, height - mid]
                : [x, mid];
              points.push(point);
              break;
            }

            if (u < utilityLevel) {
              low = mid;
            } else {
              high = mid;
            }
            iterations++;
          }

          // If we hit max iterations, use the midpoint if it's close enough
          if (iterations === maxIterations) {
            const mid = (low + high) / 2;
            const u = evaluateUtility(agent, x, mid, false);
            if (Math.abs(u - utilityLevel) < tolerance * 10) {
              const point: [number, number] = isAgent2
                ? [width - x, height - mid]
                : [x, mid];
              points.push(point);
            }
          }
        } catch {
          // Skip this point if both methods fail
          continue;
        }
      }
    }

    return points;
  };

  // Memoize the drawEdgeworthBox function
  const drawEdgeworthBox = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const canvasWidth = canvas.width / window.devicePixelRatio;
    const canvasHeight = canvas.height / window.devicePixelRatio;

    // Set up scaling with larger padding to make graph smaller
    const padding = 80;
    const scale = Math.min(
      (canvasWidth - 2 * padding) / state.boxDimensions.width,
      (canvasHeight - 2 * padding) / state.boxDimensions.height
    );

    // Helper function to convert coordinates
    const toCanvasX = (x: number) => padding + x * scale;
    const toCanvasY = (y: number) => canvasHeight - (padding + y * scale);

    // Draw grid
    ctx.beginPath();
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 1;

    // Vertical grid lines
    for (
      let x = 0;
      x <= state.boxDimensions.width;
      x += state.boxDimensions.width / 10
    ) {
      ctx.moveTo(toCanvasX(x), toCanvasY(0));
      ctx.lineTo(toCanvasX(x), toCanvasY(state.boxDimensions.height));
    }

    // Horizontal grid lines
    for (
      let y = 0;
      y <= state.boxDimensions.height;
      y += state.boxDimensions.height / 10
    ) {
      ctx.moveTo(toCanvasX(0), toCanvasY(y));
      ctx.lineTo(toCanvasX(state.boxDimensions.width), toCanvasY(y));
    }
    ctx.stroke();

    // Draw axes
    ctx.beginPath();
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 2;

    // Origin for Agent 1 (bottom-left)
    ctx.moveTo(toCanvasX(0), toCanvasY(0));
    ctx.lineTo(toCanvasX(state.boxDimensions.width), toCanvasY(0)); // X-axis
    ctx.moveTo(toCanvasX(0), toCanvasY(0));
    ctx.lineTo(toCanvasX(0), toCanvasY(state.boxDimensions.height)); // Y-axis

    // Origin for Agent 2 (top-right)
    ctx.moveTo(
      toCanvasX(state.boxDimensions.width),
      toCanvasY(state.boxDimensions.height)
    );
    ctx.lineTo(toCanvasX(0), toCanvasY(state.boxDimensions.height)); // X-axis (inverted)
    ctx.moveTo(
      toCanvasX(state.boxDimensions.width),
      toCanvasY(state.boxDimensions.height)
    );
    ctx.lineTo(toCanvasX(state.boxDimensions.width), toCanvasY(0)); // Y-axis (inverted)

    ctx.stroke();

    // Draw dimension markers
    ctx.font = "12px var(--font-geist-sans)";
    ctx.fillStyle = "#666";
    ctx.textAlign = "center";

    // X-axis markers (bottom)
    for (
      let x = 0;
      x <= state.boxDimensions.width;
      x += state.boxDimensions.width / 5
    ) {
      const xPos = toCanvasX(x);
      ctx.beginPath();
      ctx.moveTo(xPos, toCanvasY(0));
      ctx.lineTo(xPos, toCanvasY(0) + 5);
      ctx.stroke();
      ctx.fillText(x.toFixed(1), xPos, toCanvasY(0) + 20);
    }

    // Y-axis markers (right)
    for (
      let y = 0;
      y <= state.boxDimensions.height;
      y += state.boxDimensions.height / 5
    ) {
      const yPos = toCanvasY(y);
      ctx.beginPath();
      ctx.moveTo(toCanvasX(state.boxDimensions.width), yPos);
      ctx.lineTo(toCanvasX(state.boxDimensions.width) + 5, yPos);
      ctx.stroke();
      ctx.fillText(
        y.toFixed(1),
        toCanvasX(state.boxDimensions.width) + 20,
        yPos + 4
      );
    }

    // Draw axis labels
    ctx.font = "14px var(--font-geist-sans)";
    ctx.fillStyle = "#666";

    // Agent 1 labels (bottom-left origin)
    ctx.fillText(
      "Good 2",
      toCanvasX(state.boxDimensions.width / 2),
      toCanvasY(-0.5)
    );
    ctx.save();
    ctx.translate(toCanvasX(-0.5), toCanvasY(state.boxDimensions.height / 2));
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Good 1", 0, 0);
    ctx.restore();

    // Agent 2 labels (top-right origin, inverted)
    ctx.fillText(
      "Good 2",
      toCanvasX(state.boxDimensions.width / 2),
      toCanvasY(state.boxDimensions.height + 0.5)
    );
    ctx.save();
    ctx.translate(
      toCanvasX(state.boxDimensions.width + 0.5),
      toCanvasY(state.boxDimensions.height / 2)
    );
    ctx.rotate(Math.PI / 2);
    ctx.fillText("Good 1", 0, 0);
    ctx.restore();

    const drawIndifferenceCurve = (
      agent: Agent,
      utilityLevel: number,
      color: string,
      isAgent2: boolean = false
    ) => {
      const points = findIndifferenceCurvePoints(
        agent,
        utilityLevel,
        30,
        isAgent2
      );

      if (points.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5; // Make lines thicker

        // Draw simple line segments instead of curves
        ctx.moveTo(toCanvasX(points[0][0]), toCanvasY(points[0][1]));
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(toCanvasX(points[i][0]), toCanvasY(points[i][1]));
        }
        ctx.stroke();
      }
    };

    // Draw curves at and around the endowment utility levels
    const agent1Utility = evaluateUtility(
      state.agent1,
      state.agent1.endowment.x,
      state.agent1.endowment.y
    );
    const agent2Utility = evaluateUtility(
      state.agent2,
      state.agent2.endowment.x,
      state.agent2.endowment.y,
      true
    );

    // Draw fewer curves with larger steps
    [-0.5, 0, 0.5].forEach((factor) => {
      const u1 = Math.max(0.1, agent1Utility * (1 + factor));
      drawIndifferenceCurve(
        state.agent1,
        u1,
        `rgba(59, 130, 246, ${0.3 + Math.abs(factor) * 0.2})`
      );

      const u2 = Math.max(0.1, agent2Utility * (1 + factor));
      drawIndifferenceCurve(
        state.agent2,
        u2,
        `rgba(239, 68, 68, ${0.3 + Math.abs(factor) * 0.2})`,
        true
      );
    });

    // Draw endowment point
    ctx.beginPath();
    ctx.fillStyle = "#000";
    const endowmentX = toCanvasX(state.agent1.endowment.x);
    const endowmentY = toCanvasY(state.agent1.endowment.y);
    ctx.arc(endowmentX, endowmentY, 5, 0, 2 * Math.PI);
    ctx.fill();

    // Add endowment point label
    ctx.fillStyle = "#000";
    ctx.textAlign = "left";
    ctx.fillText("E", endowmentX + 8, endowmentY + 4);

    ctx.restore();
  }, [state]);

  // Reduce update frequency
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      drawEdgeworthBox();
    }, 150);

    return () => clearTimeout(debounceTimer);
  }, [
    state.agent1.endowment,
    state.agent2.endowment,
    state.agent1.utilityFunction,
    state.agent2.utilityFunction,
    drawEdgeworthBox,
  ]);

  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        drawEdgeworthBox();
      }
    };

    window.addEventListener("resize", updateCanvasSize);
    updateCanvasSize();
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-[1000px] h-[500px] grid grid-cols-[250px_1fr] gap-4">
        <div className="space-y-4">
          {/* Agent Controls */}
          <div className="space-y-4">
            {/* Agent 1 */}
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Agent 1</h2>
              <div className="space-y-1">
                <Label className="text-sm">Utility Function</Label>
                <EnhancedMathInput
                  value={state.agent1.utilityFunction}
                  onChange={(value) =>
                    setState((prev) => ({
                      ...prev,
                      agent1: { ...prev.agent1, utilityFunction: value },
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-sm">Good 1</Label>
                  <Input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={state.agent1.endowment.x}
                    onChange={(e) =>
                      handleEndowmentChange("agent1", "x", e.target.value)
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="text-sm">Good 2</Label>
                  <Input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={state.agent1.endowment.y}
                    onChange={(e) =>
                      handleEndowmentChange("agent1", "y", e.target.value)
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Agent 2 */}
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Agent 2</h2>
              <div className="space-y-1">
                <Label className="text-sm">Utility Function</Label>
                <EnhancedMathInput
                  value={state.agent2.utilityFunction}
                  onChange={(value) =>
                    setState((prev) => ({
                      ...prev,
                      agent2: { ...prev.agent2, utilityFunction: value },
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-sm">Good 1</Label>
                  <Input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={state.agent2.endowment.x}
                    onChange={(e) =>
                      handleEndowmentChange("agent2", "x", e.target.value)
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="text-sm">Good 2</Label>
                  <Input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={state.agent2.endowment.y}
                    onChange={(e) =>
                      handleEndowmentChange("agent2", "y", e.target.value)
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="bg-background border rounded-lg p-4 h-[500px]">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}
