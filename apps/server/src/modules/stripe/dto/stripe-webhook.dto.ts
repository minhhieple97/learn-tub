import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class WebhookRequestDto {
  @IsString()
  @IsNotEmpty()
  body: string;

  @IsString()
  @IsNotEmpty()
  signature: string;
}

export class StripeEventDataDto {
  @IsObject()
  object: any;
}

export class StripeEventDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @ValidateNested()
  @Type(() => StripeEventDataDto)
  data: StripeEventDataDto;

  @IsString()
  @IsOptional()
  api_version?: string;

  @IsOptional()
  created?: number;

  @IsOptional()
  livemode?: boolean;

  @IsOptional()
  pending_webhooks?: number;

  @IsOptional()
  request?: {
    id?: string;
    idempotency_key?: string;
  };
}

export class WebhookProcessingResponseDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  eventId?: string;

  @IsOptional()
  queued?: boolean;
}
