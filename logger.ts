import { detailedDiff } from 'deep-object-diff';

export const logger = (message: string, color?: string, object = {}) => {
  const args = [`%c${message}`, `color: ${color}; font-weight: bold;\n`]
  if (object && Object.keys(object).length) {
    console.log(...args, object);
  } else {
    console.log(...args);
  }
};

export function logStateChange(prevState, newState, groupName) {
  const diff = detailedDiff(prevState, newState);

  console.groupCollapsed(groupName);
  if (Object.keys(diff.added).length) {
    logger('Added', '#18A76D', diff.added);
  }

  if (Object.keys(diff.updated).length) {
    logger('Updated', '#FDA429', diff.updated);
  }

  if (Object.keys(diff.deleted).length) {
    logger('Deleted', '#f04545', diff.deleted);
  }

  logger('Old state: ', '#555555', Object.assign({}, prevState));
  logger('New state: ', '#555555', Object.assign({}, newState))
  console.groupEnd();
};
