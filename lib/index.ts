export function meaningOfLife(): number {
  let answer: number;

  console.log('Calculating the meaning of life:');
  answer = 42;

  return answer;
}

module.exports.meaningOfLife = meaningOfLife;

export default {
  meaningOfLife,
};
