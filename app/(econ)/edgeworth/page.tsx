"use client";

export default function EdgeworthBox() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-background p-4">
      <div className="w-full h-full max-w-[1200px] rounded-lg border overflow-hidden">
        <iframe
          src="https://edgeworthexplorer-eahl64dptndaqwtqtwrfyc.streamlit.app?embed=true"
          className="w-full h-full"
          allow="fullscreen"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          loading="lazy"
        />
      </div>
    </div>
  );
}
