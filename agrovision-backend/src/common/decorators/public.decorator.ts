import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
/** Mark an endpoint as publicly accessible without JWT token */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
