export interface BlueskyPost {
  post: {
    uri: string;
    cid: string;
    author: {
      did: string;
      handle: string;
      displayName: string;
      avatar?: string;
    };
    record: {
      text: string;
      createdAt: string;
      embed?: {
        images?: Array<{
          alt: string;
          image: {
            ref: {
              $link: string;
            };
            mimeType: string;
            size: number;
          };
        }>;
        record?: {
          uri: string;
          cid: string;
          author: {
            did: string;
            handle: string;
            displayName: string;
            avatar?: string;
          };
          value: {
            text: string;
            createdAt: string;
            embed?: {
              images?: Array<{
                alt: string;
                image: {
                  ref: {
                    $link: string;
                  };
                  mimeType: string;
                  size: number;
                };
              }>;
            };
          };
        };
      };
      reply?: {
        root: {
          uri: string;
          cid: string;
        };
        parent: {
          uri: string;
          cid: string;
        };
      };
    };
    likeCount: number;
    replyCount: number;
    repostCount: number;
    quoteCount: number;
  };
}
