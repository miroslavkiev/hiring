declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      email: string;
    };
  }
}
