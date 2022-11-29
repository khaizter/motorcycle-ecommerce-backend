const throwError = (
  errorMessage: string,
  statusCode: number,
  data?: any
): never => {
  const error: any = new Error(errorMessage);
  error.statusCode = statusCode;
  error.data = data;
  throw error;
};

export default throwError;
