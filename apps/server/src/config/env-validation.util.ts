import { envValidationSchema } from './env-validation.schema';
import { EnvironmentVariables } from './env.types';

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const { error, value } = envValidationSchema.validate(config, {
    allowUnknown: true,
    abortEarly: false,
  });

  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    throw new Error(
      `Environment validation failed:\n${errorMessages.join('\n')}`,
    );
  }

  return value;
} 