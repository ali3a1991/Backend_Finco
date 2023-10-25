"use strict"

export const validateCardNbr = (cardNr) => {
  let luhnArr = [];
  let cardNrCopy = cardNr.slice();

  for (let i = cardNrCopy.length - 1; i >= 0; i--) {
      if (i % 2 === 0) {
          cardNrCopy[i] *= 2;
          if (cardNrCopy[i] > 9) {
              cardNrCopy[i] -= 9;
          };
      };
      luhnArr.unshift(cardNrCopy[i]);
  };
  return (luhnArr.reduce((acc, currVal) => acc + currVal) % 10 === 0) ? true : false;
};