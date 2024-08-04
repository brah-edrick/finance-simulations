
export type InterestWithContributionsParameters = {
  presentValue: number;
  rateOfReturn: number;
  years: number;
  annualContributionAmount: number;
};

export const calculateFutureValueInterestWithContributions = ({
  presentValue,
  rateOfReturn,
  years,
  annualContributionAmount,
}: InterestWithContributionsParameters): number => {
  const futureValueOfPresent = presentValue * Math.pow(1 + rateOfReturn, years);
  const futureValueOfContributions =
    annualContributionAmount *
    ((Math.pow(1 + rateOfReturn, years) - 1) / rateOfReturn);
  return futureValueOfPresent + futureValueOfContributions;
};

export type RequiredPresentValueParameters = {
  rateOfReturn: number;
  years: number;
  annualContributionAmount: number;
  targetBalance: number;
};

export const calculateRequiredPresentValue = ({
  rateOfReturn,
  years,
  annualContributionAmount,
  targetBalance = 0,
}: RequiredPresentValueParameters): number => {
  const futureValueOfContributions =
    annualContributionAmount *
    ((Math.pow(1 + rateOfReturn, years) - 1) / rateOfReturn);
  const requiredPresentValue =
    (targetBalance - futureValueOfContributions) /
    Math.pow(1 + rateOfReturn, years);
  return requiredPresentValue;
};

export type RequiredContributionsParameters = {
  presentValue: number;
  rateOfReturn: number;
  years: number;
  targetBalance: number;
};

export const calculateRequiredContributions = ({
  presentValue,
  rateOfReturn,
  years,
  targetBalance,
}: RequiredContributionsParameters): number => {
  const futureValueOfPresent = presentValue * Math.pow(1 + rateOfReturn, years);
  const requiredContributions =
    (targetBalance - futureValueOfPresent) /
    ((Math.pow(1 + rateOfReturn, years) - 1) / rateOfReturn);
  return requiredContributions;
};

export type PrincipalTotalParameters = {
  presentValue: number;
  years: number;
  annualContributionAmount: number;
};

export const calculatePrincipalTotal = ({
  presentValue,
  years,
  annualContributionAmount,
}: PrincipalTotalParameters) => {
  return presentValue + years * annualContributionAmount;
};

export const formatNumberToUSD = function (number: number | null) {
  if (number === null) {
    return "";
  }

  const truncated = Math.trunc(number * 100) / 100;
  if (Number.isNaN(truncated)) {
    return "Error";
  }
  return (
    "$ " +
    new Intl.NumberFormat("us")
      .format(Math.trunc(number * 100) / 100)
      .toString()
  );
};