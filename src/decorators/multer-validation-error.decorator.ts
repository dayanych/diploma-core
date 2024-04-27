import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const MulterValidationError = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const valiationError: string = request.fileValidationError;
    return valiationError;
  },
);
