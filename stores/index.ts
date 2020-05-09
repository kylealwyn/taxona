import { createTaxona } from '../dewey';
import counter from './counter';
import todo from './todo';

export const { 
  Provider,
  useTaxona,
} = createTaxona({
  reducers: {
    counter,
    todo,
  }
})