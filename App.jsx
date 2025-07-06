import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts'
import { Calculator, TrendingUp, DollarSign } from 'lucide-react'
import './App.css'

function App() {
  const [inputs, setInputs] = useState({
    years: 5,
    interestRate: 3.5,
    startingAmount: 30000,
    monthlyContribution: 300,
    taxRate: 0,
    applyTax: false,
    contributionPeriod: 'full', // 'full' or 'limited'
    contributionYears: 5,
    lumpSumAmount: 0,
    lumpSumYear: 1
  })

  const [results, setResults] = useState([])
  const [summary, setSummary] = useState({
    totalInvested: 0,
    totalInterest: 0,
    totalTaxes: 0,
    finalBalance: 0
  })

  const [withdrawalInputs, setWithdrawalInputs] = useState({
    withdrawalYears: 10,
    withdrawalInterestRate: 3.5
  })
  const [withdrawalResults, setWithdrawalResults] = useState([])
  const [yearlyWithdrawalAmount, setYearlyWithdrawalAmount] = useState(0)
  const [monthlyWithdrawalAmount, setMonthlyWithdrawalAmount] = useState(0)

  const calculateInvestment = () => {
    const data = []
    let balance = parseFloat(inputs.startingAmount) || 0
    let totalInvested = balance
    let totalInterest = 0
    let totalTaxes = 0

    for (let year = 1; year <= inputs.years; year++) {
      const startingBalance = balance
      let yearlyContributions = 0
      let interestEarned = 0
      let taxesPaid = 0

      // Add monthly contributions if within contribution period
      if (inputs.contributionPeriod === 'full' || year <= inputs.contributionYears) {
        yearlyContributions = (parseFloat(inputs.monthlyContribution) || 0) * 12
        totalInvested += yearlyContributions
      }

      // Add lump sum if this is the specified year
      if (year === parseInt(inputs.lumpSumYear) && inputs.lumpSumAmount > 0) {
        yearlyContributions += parseFloat(inputs.lumpSumAmount) || 0
        totalInvested += parseFloat(inputs.lumpSumAmount) || 0
      }

      // Calculate interest on starting balance + half of yearly contributions (assuming contributions are made throughout the year)
      const averageBalance = startingBalance + (yearlyContributions / 2)
      interestEarned = averageBalance * (parseFloat(inputs.interestRate) / 100)
      totalInterest += interestEarned

      // Calculate taxes on interest if enabled
      if (inputs.applyTax && interestEarned > 0) {
        taxesPaid = interestEarned * (parseFloat(inputs.taxRate) / 100)
        totalTaxes += taxesPaid
      }

      // Update balance
      balance = startingBalance + yearlyContributions + interestEarned - taxesPaid

      data.push({
        year: year,
        startingBalance: Math.round(startingBalance * 100) / 100,
        contributions: Math.round(yearlyContributions * 100) / 100,
        interestEarned: Math.round(interestEarned * 100) / 100,
        taxesPaid: Math.round(taxesPaid * 100) / 100,
        endingBalance: Math.round(balance * 100) / 100
      })
    }

    setResults(data)
    setSummary({
      totalInvested: Math.round(totalInvested * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalTaxes: Math.round(totalTaxes * 100) / 100,
      finalBalance: Math.round(balance * 100) / 100
    })
  }

  const calculateWithdrawal = () => {
    let balance = summary.finalBalance
    const data = [{
      year: 0,
      startingBalance: summary.finalBalance,
      interestEarned: 0,
      withdrawal: 0,
      endingBalance: summary.finalBalance
    }]
    const years = parseInt(withdrawalInputs.withdrawalYears) || 1
    const interestRate = parseFloat(withdrawalInputs.withdrawalInterestRate) / 100 || 0

    if (balance <= 0 || years <= 0) {
      setWithdrawalResults([])
      setYearlyWithdrawalAmount(0)
      setMonthlyWithdrawalAmount(0)
      return
    }

    // Calculate the annual withdrawal amount using the PMT formula
    // PMT = (PV * r) / (1 - (1 + r)^-n)
    let annualWithdrawal = 0
    if (interestRate === 0) {
      annualWithdrawal = balance / years
    } else {
      annualWithdrawal = (balance * interestRate) / (1 - Math.pow(1 + interestRate, -years))
    }

    for (let year = 1; year <= years; year++) {
      const startingBalance = balance
      const interestEarned = startingBalance * interestRate
      balance = startingBalance + interestEarned - annualWithdrawal

      data.push({
        year: year,
        startingBalance: Math.round(startingBalance * 100) / 100,
        interestEarned: Math.round(interestEarned * 100) / 100,
        withdrawal: Math.round(annualWithdrawal * 100) / 100,
        endingBalance: Math.round(balance * 100) / 100
      })
    }

    setWithdrawalResults(data)
    setYearlyWithdrawalAmount(Math.round(annualWithdrawal * 100) / 100)
    setMonthlyWithdrawalAmount(Math.round((annualWithdrawal / 12) * 100) / 100)
  }

  useEffect(() => {
    calculateInvestment()
  }, [inputs])

  useEffect(() => {
    calculateWithdrawal()
  }, [summary.finalBalance, withdrawalInputs])

  const handleInputChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calculator className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Investment Growth Calculator</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Calculate your investment growth over time with compound interest, taxes, and flexible contribution options.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Investment Parameters
                </CardTitle>
                <CardDescription>
                  Enter your investment details to calculate growth projections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <Label htmlFor="years">Investment Period (Years)</Label>
                    <Input
                      id="years"
                      type="number"
                      min="1"
                      max="50"
                      value={inputs.years}
                      onChange={(e) => handleInputChange("years", e.target.value === "" ? "" : parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <Label htmlFor="interestRate">Annual Interest Rate (%)</Label>
                    <Input
                      id="interestRate"
                      type="number"
                      step="0.1"
                      min="0"
                      max="50"
                      value={inputs.interestRate}
                      onChange={(e) => handleInputChange("interestRate", e.target.value === "" ? "" : parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <Label htmlFor="startingAmount">Starting Amount</Label>
                    <Input
                      id="startingAmount"
                      type="number"
                      min="0"
                      step="100"
                      value={inputs.startingAmount}
                      onChange={(e) => handleInputChange("startingAmount", e.target.value === "" ? "" : parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <Label htmlFor="monthlyContribution">Monthly Contribution</Label>
                    <Input
                      id="monthlyContribution"
                      type="number"
                      min="0"
                      step="10"
                      value={inputs.monthlyContribution}
                      onChange={(e) => handleInputChange("monthlyContribution", e.target.value === "" ? "" : parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="applyTax"
                      checked={inputs.applyTax}
                      onCheckedChange={(checked) => handleInputChange('applyTax', checked)}
                    />
                    <Label htmlFor="applyTax">Apply annual tax on interest earned</Label>
                  </div>
                  {inputs.applyTax && (
                    <div>
                      <Label htmlFor="taxRate">Annual Tax Rate (%)</Label>
                      <Input
                        id="taxRate"
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={inputs.taxRate}
                        onChange={(e) => handleInputChange("taxRate", e.target.value === "" ? "" : parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Contribution Period</Label>
                  <Select
                    value={inputs.contributionPeriod}
                    onValueChange={(value) => handleInputChange('contributionPeriod', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full investment period</SelectItem>
                      <SelectItem value="limited">Limited years only</SelectItem>
                    </SelectContent>
                  </Select>
                  {inputs.contributionPeriod === 'limited' && (
                    <div>
                      <Label htmlFor="contributionYears">Contribution Years</Label>
                      <Input
                        id="contributionYears"
                        type="number"
                        min="1"
                        max={inputs.years}
                        value={inputs.contributionYears}
                        onChange={(e) => handleInputChange("contributionYears", e.target.value === "" ? "" : parseInt(e.target.value) || 0)}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Lump Sum Payment (Optional)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="lumpSumAmount">Amount</Label>
                      <Input
                        id="lumpSumAmount"
                        type="number"
                        min="0"
                        step="100"
                        value={inputs.lumpSumAmount}
                        onChange={(e) => handleInputChange("lumpSumAmount", e.target.value === "" ? "" : parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lumpSumYear">In Year</Label>
                      <Input
                        id="lumpSumYear"
                        type="number"
                        min="1"
                        max={inputs.years}
                        value={inputs.lumpSumYear}
                        onChange={(e) => handleInputChange("lumpSumYear", e.target.value === "" ? "" : parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Investment Growth Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">{formatCurrency(summary.totalInvested)}</div>
                      <div className="text-sm text-gray-600">Total Invested</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalInterest)}</div>
                      <div className="text-sm text-gray-600">Interest Earned</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalTaxes)}</div>
                      <div className="text-sm text-gray-600">Taxes Paid</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">{formatCurrency(summary.finalBalance)}</div>
                      <div className="text-sm text-gray-600">Final Balance</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tabs for Chart and Table */}
                <Tabs defaultValue="chart" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="chart">Chart View</TabsTrigger>
                    <TabsTrigger value="table">Table View</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="chart" className="mt-6">
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={results} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                          <Tooltip formatter={(value) => formatCurrency(value)} />
                          <Legend />
                          <Bar dataKey="endingBalance" fill="#10b981" name="Balance">
                            <LabelList dataKey="endingBalance" position="top" formatter={(value) => `${(value / 1000).toFixed(0)}k`} style={{ fontSize: inputs.years > 10 ? 10 : 12 }} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="table" className="mt-6">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-300 p-2 text-left">Year</th>
                            <th className="border border-gray-300 p-2 text-right">Starting Balance</th>
                            <th className="border border-gray-300 p-2 text-right">Contributions</th>
                            <th className="border border-gray-300 p-2 text-right">Interest Earned</th>
                            <th className="border border-gray-300 p-2 text-right">Taxes Paid</th>
                            <th className="border border-gray-300 p-2 text-right">Ending Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.map((row) => (
                            <tr key={row.year} className="hover:bg-gray-50">
                              <td className="border border-gray-300 p-2 font-medium">{row.year}</td>
                              <td className="border border-gray-300 p-2 text-right">{formatCurrency(row.startingBalance)}</td>
                              <td className="border border-gray-300 p-2 text-right">{formatCurrency(row.contributions)}</td>
                              <td className="border border-gray-300 p-2 text-right text-green-600">{formatCurrency(row.interestEarned)}</td>
                              <td className="border border-gray-300 p-2 text-right text-red-600">{formatCurrency(row.taxesPaid)}</td>
                              <td className="border border-gray-300 p-2 text-right font-semibold">{formatCurrency(row.endingBalance)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Withdrawal Section */}
        <div className="mt-10">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Withdrawal Planning
              </CardTitle>
              <CardDescription>
                Plan your withdrawals based on your final investment balance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="withdrawalYears">Withdrawal Period (Years)</Label>
                  <Input
                    id="withdrawalYears"
                    type="number"
                    min="1"
                    max="50"
                    value={withdrawalInputs.withdrawalYears}
                    onChange={(e) => setWithdrawalInputs(prev => ({ ...prev, withdrawalYears: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="withdrawalInterestRate">Annual Interest Rate During Withdrawal (%)</Label>
                  <Input
                    id="withdrawalInterestRate"
                    type="number"
                    step="0.1"
                    min="0"
                    max="50"
                    value={withdrawalInputs.withdrawalInterestRate}
                    onChange={(e) => setWithdrawalInputs(prev => ({ ...prev, withdrawalInterestRate: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{formatCurrency(yearlyWithdrawalAmount)}</div>
                    <div className="text-sm text-gray-600">Yearly Withdrawal</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(monthlyWithdrawalAmount)}</div>
                    <div className="text-sm text-gray-600">Monthly Withdrawal</div>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="chart" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="chart">Chart View</TabsTrigger>
                  <TabsTrigger value="table">Table View</TabsTrigger>
                </TabsList>
                
                <TabsContent value="chart" className="mt-6">
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={withdrawalResults} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="endingBalance" fill="#8884d8" name="Remaining Balance">
                          <LabelList dataKey="endingBalance" position="top" formatter={(value) => `${(value / 1000).toFixed(0)}k`} style={{ fontSize: withdrawalInputs.withdrawalYears > 10 ? 10 : 12 }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
                
                <TabsContent value="table" className="mt-6">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 p-2 text-left">Year</th>
                          <th className="border border-gray-300 p-2 text-right">Starting Balance</th>
                          <th className="border border-gray-300 p-2 text-right">Interest Earned</th>
                          <th className="border border-gray-300 p-2 text-right">Withdrawal</th>
                          <th className="border border-gray-300 p-2 text-right">Ending Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {withdrawalResults.map((row) => (
                          <tr key={row.year} className="hover:bg-gray-50">
                            <td className="border border-gray-300 p-2 font-medium">{row.year}</td>
                            <td className="border border-gray-300 p-2 text-right">{formatCurrency(row.startingBalance)}</td>
                            <td className="border border-gray-300 p-2 text-right text-green-600">{formatCurrency(row.interestEarned)}</td>
                            <td className="border border-gray-300 p-2 text-right text-red-600">{formatCurrency(row.withdrawal)}</td>
                            <td className="border border-gray-300 p-2 text-right font-semibold">{formatCurrency(row.endingBalance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}



