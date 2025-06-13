import { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  getAIModelPricing,
  getAIModelOptions,
  getAIModelOptionsByProvider,
  getAIProviders,
  getAIModelData,
} from '@/features/ai/queries/ai-model-pricing-queries';
import { RESPONSE_HEADERS, ERROR_MESSAGES, HTTP_STATUS } from '@/config/constants';
import { getUserInSession } from '@/features/profile/queries';

const AIModelsQuerySchema = z.object({
  provider_id: z.string().uuid().optional(),
  model_name: z.string().optional(),
  is_active: z.coerce.boolean().optional(),
  type: z
    .enum(['all', 'options', 'provider', 'providers', 'options-by-provider'])
    .optional()
    .default('all'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    const user = await getUserInSession();

    if (!user) {
      return new Response(ERROR_MESSAGES.UNAUTHORIZED, {
        status: HTTP_STATUS.UNAUTHORIZED,
        headers: RESPONSE_HEADERS,
      });
    }

    let data;
    switch (type) {
      case 'all':
        data = await getAIModelData();
        break;
      case 'providers':
        data = await getAIProviders();
        break;
      case 'options':
        data = await getAIModelOptions();
        break;
      case 'options-by-provider': {
        const providerId = searchParams.get('provider_id');
        if (!providerId) {
          return new Response(JSON.stringify({ error: 'Provider ID is required' }), {
            status: HTTP_STATUS.BAD_REQUEST,
            headers: RESPONSE_HEADERS,
          });
        }
        data = await getAIModelOptionsByProvider(providerId);
        break;
      }
      default: {
        const result = AIModelsQuerySchema.safeParse({
          provider_id: searchParams.get('provider_id'),
          model_name: searchParams.get('model_name'),
          is_active: searchParams.get('is_active') === 'true',
        });
        if (!result.success) {
          return new Response(JSON.stringify({ error: result.error.message }), {
            status: HTTP_STATUS.BAD_REQUEST,
            headers: RESPONSE_HEADERS,
          });
        }
        data = await getAIModelPricing(result.data);
      }
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: RESPONSE_HEADERS,
    });
  } catch (error) {
    console.error('Error in AI models API:', error);
    return new Response(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, {
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      headers: RESPONSE_HEADERS,
    });
  }
}
