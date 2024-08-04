
export type InterestWithContributionsParameters = {
  presentValue: number;
  rateOfReturn: number;
  periods: number;
  contributionAmount: number;
};

export const calculateFutureValueInterestWithContributions = ({
  presentValue,
  rateOfReturn,
  periods,
  contributionAmount,
}: InterestWithContributionsParameters): number => {
  console.table({ presentValue, rateOfReturn, periods, contributionAmount });
  const futureValueOfPresent = presentValue * Math.pow(1 + rateOfReturn, periods,);
  const futureValueOfContributions =
    contributionAmount *
    ((Math.pow(1 + rateOfReturn, periods) - 1) / rateOfReturn);
  return futureValueOfPresent + futureValueOfContributions;
};

export type RequiredPresentValueParameters = {
  rateOfReturn: number;
  period: number;
  annualContributionAmount: number;
  targetBalance: number;
};

export const calculateRequiredPresentValue = ({
  rateOfReturn,
  period,
  annualContributionAmount,
  targetBalance = 0,
}: RequiredPresentValueParameters): number => {
  const futureValueOfContributions =
    annualContributionAmount *
    ((Math.pow(1 + rateOfReturn, period) - 1) / rateOfReturn);
  const requiredPresentValue =
    (targetBalance - futureValueOfContributions) /
    Math.pow(1 + rateOfReturn, period);
  return requiredPresentValue;
};

export type RequiredContributionsParameters = {
  presentValue: number;
  rateOfReturn: number;
  period: number;
  targetBalance: number;
};

export const calculateRequiredContributions = ({
  presentValue,
  rateOfReturn,
  period,
  targetBalance,
}: RequiredContributionsParameters): number => {
  const futureValueOfPresent = presentValue * Math.pow(1 + rateOfReturn, period);
  const requiredContributions =
    (targetBalance - futureValueOfPresent) /
    ((Math.pow(1 + rateOfReturn, period) - 1) / rateOfReturn);
  return requiredContributions;
};

export type PrincipalTotalParameters = {
  presentValue: number;
  periods: number;
  contributionAmount: number;
};

export const calculatePrincipalTotal = ({
  presentValue,
  periods: years,
  contributionAmount: annualContributionAmount,
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