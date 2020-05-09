import { createTaxona } from '../taxona';
import counter from './counter';
import todo from './todo';

export const { 
  Provider,
  useTaxona,
} = createTaxona({
  counter,
  todo,
})