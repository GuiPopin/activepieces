import { gelatoAuth } from '../../';
import {
  DedupeStrategy,
  HttpMethod,
  HttpRequest,
  Polling,
  httpClient,
  pollingHelper,
} from '@activepieces/pieces-common';
import {
  TriggerStrategy,
  createTrigger,
  AppConnectionValueForAuthProperty
} from '@activepieces/pieces-framework';
import dayjs from 'dayjs';

const polling: Polling<
  AppConnectionValueForAuthProperty<typeof gelatoAuth>,
  Record<string, never>
> = {
  strategy: DedupeStrategy.TIMEBASED,
  items: async ({ auth, propsValue: _propsValue, lastFetchEpochMS: _lastFetchEpochMS }) => {
    const request: HttpRequest = {
      method: HttpMethod.GET,
      url: 'https://cloud.activepieces.com/api/v1/webhooks/aHlEaNLc6vcF1nY2XJ2ed/sync',
      headers: {
        authorization: auth.secret_text,
      },
    };
    const res = await httpClient.sendRequest(request);
    return (res.body['flavors'] ?? []).map((flavor: string) => ({
      epochMilliSeconds: dayjs().valueOf(),
      data: flavor,
    }));
  },
};

export const newFlavorCreated = createTrigger({
  auth: gelatoAuth,
  name: 'newFlavorCreated',
  displayName: 'new flavor created',
  description: 'triggers when a new icecream flavor is created.',
  props: {},
  sampleData: {},
  type: TriggerStrategy.POLLING,
  async test(context) {
    return await pollingHelper.test(polling, context);
  },
  async onEnable(context) {
    await pollingHelper.onEnable(polling, context);
  },

  async onDisable(context) {
    await pollingHelper.onDisable(polling, context);
  },

  async run(context) {
    return await pollingHelper.poll(polling, context);
  },
});
