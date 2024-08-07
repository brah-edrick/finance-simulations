import React from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import {
  calculateFutureValueInterestWithContributions,
  calculatePrincipalTotal,
  formatNumberToUSD,
} from "../Utils";
import {
  CurrencyDollarIcon,
  PercentBadgeIcon,
} from "@heroicons/react/24/outline";
import {
  Card,
  AreaChart,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@tremor/react";
import { CustomNumberInput } from "../Components/CustomNumberInput";

type FormValues<T> = {
  currentAmount: T;
  monthlyContributions: T;
  interestRate: T;
};

type FormValuesAsNumbers = FormValues<number>;
type FormValuesAsStrings = FormValues<string>;

type CompoundInterestChartData = {
  month: number;
  Balance: number;
  Principal: number;
  Interest: number;
};

const defaultValues: FormValuesAsStrings = {
  currentAmount: "0",
  monthlyContributions: "833.33",
  interestRate: "7",
};

const castStringsToNumbers = (
  defaultFormValues: FormValuesAsStrings
): FormValuesAsNumbers => {
  return Object.fromEntries(
    Object.entries(defaultFormValues).map(([key, value]) => [
      key,
      parseFloat(value),
    ])
  ) as FormValuesAsNumbers;
};

const convertMonthsToYearsAndMonths = (months: number) => {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  return `${years > 1 ? `${years} years` : years === 1 ? `1 year` : ""} ${
    years > 0 && remainingMonths > 0 ? "and " : ""
  }${remainingMonths > 0 ? `${remainingMonths} months` : ""}`;
};

const HundredThousandMilestones = [
  100000, 200000, 300000, 400000, 500000, 600000, 700000, 800000, 900000,
  1000000,
];

const DataColors = ["indigo", "pink", "lime"];

const createFullDataSet = ({
  currentAmount,
  monthlyContributions,
  interestRate,
}: FormValuesAsNumbers): CompoundInterestChartData[] => {
  let data: CompoundInterestChartData[] = [
    {
      month: 0,
      Balance: currentAmount,
      Principal: currentAmount,
      Interest: 0,
    },
  ];
  let i = 1;
  while (data[data.length - 1].Balance < 1000000) {
    if (i > 1000) {
      break;
    }
    const Balance = calculateFutureValueInterestWithContributions({
      presentValue: currentAmount,
      periods: i,
      contributionAmount: monthlyContributions,
      rateOfReturn: interestRate / 100 / 12,
    });
    const Principal = calculatePrincipalTotal({
      presentValue: currentAmount,
      periods: i,
      contributionAmount: monthlyContributions,
    });
    console.log(Balance, Principal, Balance - Principal);
    data.push({
      month: i,
      Balance,
      Principal,
      Interest: Balance - Principal,
    });
    i++;
  }
  return data;
};

export const RoadToMillionaireCalculator: React.FC = () => {
  const [data, setData] = React.useState(
    createFullDataSet(castStringsToNumbers(defaultValues))
  );
  const [lastSubmitted, setLastSubmitted] = React.useState<FormValuesAsNumbers>(
    castStringsToNumbers(defaultValues)
  );

  const { control, watch } = useForm<FormValuesAsStrings>({
    defaultValues,
  });

  const onSubmit: SubmitHandler<any> = (data: FormValuesAsStrings) => {
    try {
      const valuesAsNumbers = castStringsToNumbers(data);
      setData(createFullDataSet(valuesAsNumbers));
      setLastSubmitted(valuesAsNumbers);
    } catch {
      console.log("uh oh :(");
    }
  };

  React.useEffect(() => {
    const subscription = watch((value) => onSubmit(value));
    return () => subscription.unsubscribe();
  }, [watch]);

  function getLargestBalance(data: CompoundInterestChartData[]) {
    return Math.max(...data.map((entry) => entry.Balance));
  }

  return (
    <div className="w-full flex gap-8 content-start items-start">
      <Card className="w-256">
        <h3 className="text-tremor-title text-tremor-content-strong dark:text-dark-tremor-content-strong mb-4">
          Road to Millionaire Calculator
        </h3>
        <form>
          <div className="flex gap-4 flex-col">
            <Controller
              name="currentAmount"
              control={control}
              render={({ field }) => (
                <CustomNumberInput
                  {...field}
                  label="Current Amount"
                  placeholder="0"
                  required={true}
                  icon={CurrencyDollarIcon}
                  step={100}
                />
              )}
            />
            <Controller
              name="monthlyContributions"
              control={control}
              render={({ field }) => (
                <CustomNumberInput
                  {...field}
                  label="Monthly Contributions"
                  placeholder="100"
                  required={true}
                  icon={CurrencyDollarIcon}
                  step={10}
                />
              )}
            />

            <Controller
              name="interestRate"
              control={control}
              render={({ field }) => (
                <CustomNumberInput
                  {...field}
                  label="Interest Rate"
                  placeholder="10"
                  required={true}
                  icon={PercentBadgeIcon}
                  step={0.1}
                />
              )}
            />
          </div>
        </form>
      </Card>
      <div className="flex flew-grow-1 w-full flex-col gap-8">
        <Card>
          <div className="flex">
            <div>
              <h3 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                You could become a millionaire in...
              </h3>
              <p className="text-tremor-metric text-tremor-content dark:text-dark-tremor-content-strong font-semibold">
                {convertMonthsToYearsAndMonths(data[data.length - 1].month)}
              </p>
            </div>
          </div>

          <AreaChart
            showAnimation={true}
            curveType="linear"
            className="mt-4 h-72"
            data={data}
            index="month"
            yAxisWidth={getLargestBalance(data).toString().length * 5.5}
            categories={["Balance", "Principal", "Interest"]}
            colors={DataColors}
            valueFormatter={formatNumberToUSD}
            rotateLabelX={{ angle: -45, verticalShift: 15, xAxisHeight: 40 }}
            animationDuration={320}
            xAxisLabel="Month"
          />
        </Card>
        <Card>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Milestone</TableHeaderCell>
                <TableHeaderCell>Time</TableHeaderCell>
                <TableHeaderCell>
                  <span className="inline-flex items-center">
                    <span
                      className={`flex w-2 h-2 me-2 bg-${DataColors[0]}-500 rounded-full`}
                    ></span>
                  </span>
                  Balance
                </TableHeaderCell>
                <TableHeaderCell>
                  <span className="inline-flex items-center">
                    <span
                      className={`flex w-2 h-2 me-2 bg-${DataColors[1]}-500 rounded-full`}
                    ></span>
                  </span>
                  Principal
                </TableHeaderCell>
                <TableHeaderCell>
                  <span className="inline-flex items-center">
                    <span
                      className={`flex w-2 h-2 me-2 bg-${DataColors[2]}-500 rounded-full`}
                    ></span>
                  </span>
                  Interest
                </TableHeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {HundredThousandMilestones.map((ms, i) => {
                const previousMilestone = HundredThousandMilestones[i - 1] || 0;
                const milestone = data.find((entry) => entry.Balance >= ms);
                const previousMilestoneEntry = data.find(
                  (entry) => entry.Balance >= previousMilestone
                );
                if (!milestone || lastSubmitted.currentAmount >= ms) {
                  return null;
                }
                return (
                  <TableRow key={i}>
                    <TableCell>{formatNumberToUSD(ms)}</TableCell>
                    <TableCell>
                      {convertMonthsToYearsAndMonths(
                        milestone.month - (previousMilestoneEntry?.month || 0)
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          milestone.Balance > 1000000
                            ? "text-yellow-600 dark:text-yellow-400"
                            : ""
                        }
                      >
                        {formatNumberToUSD(milestone.Balance)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {formatNumberToUSD(milestone.Principal)}
                    </TableCell>
                    <TableCell>
                      {formatNumberToUSD(milestone.Interest)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};
