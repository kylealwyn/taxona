import { createPhyla } from '../../lib/phyla';
import counter from './counter';
import todo from './todo';

export const { Provider, usePhyla } = createPhyla({
  counter,
  todo,
});
