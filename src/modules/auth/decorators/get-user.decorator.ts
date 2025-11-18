import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const GetUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    // Detectar si es GraphQL o HTTP
    const contextType = context.getType<string>();
    
    let request;
    if (contextType === 'graphql') {
      // Para GraphQL
      const ctx = GqlExecutionContext.create(context);
      request = ctx.getContext().req;
    } else {
      // Para HTTP (REST)
      request = context.switchToHttp().getRequest();
    }
    
    const user = request?.user;

    return data ? user?.[data] : user;
  },
);
