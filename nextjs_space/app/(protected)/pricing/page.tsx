
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  Package, 
  AlertCircle, 
  Save, 
  Trash2,
  Building2,
  Zap,
  Wifi,
  Phone,
  Droplet,
  Users,
  Car,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import toast from "react-hot-toast";

interface SavedProduct {
  id: string;
  name: string;
  cost: number;
  finalPrice: number;
  margin: number;
}

interface FixedCosts {
  aluguel: string;
  energia: string;
  internet: string;
  telefone: string;
  agua: string;
  gas: string;
  iptu: string;
  condominio: string;
  contabilidade: string;
  marketing: string;
  software: string;
  seguro: string;
  manutencao: string;
  gasolina: string;
  outros: string;
}

interface Employee {
  id: string;
  salary: string;
  workDays: string;
}

export default function PricingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Estados do formulário
  const [productName, setProductName] = useState("");
  const [productType, setProductType] = useState<"product" | "service">("product");
  const [cost, setCost] = useState("");
  const [expectedSales, setExpectedSales] = useState("");
  const [variableExpenses, setVariableExpenses] = useState("5");
  const [taxRegime, setTaxRegime] = useState("simples_nacional");
  const [taxRate, setTaxRate] = useState("6");
  const [desiredMargin, setDesiredMargin] = useState("30");

  // Custos fixos detalhados
  const [fixedCosts, setFixedCosts] = useState<FixedCosts>({
    aluguel: "",
    energia: "",
    internet: "",
    telefone: "",
    agua: "",
    gas: "",
    iptu: "",
    condominio: "",
    contabilidade: "",
    marketing: "",
    software: "",
    seguro: "",
    manutencao: "",
    gasolina: "",
    outros: "",
  });

  // Funcionários
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [newEmployeeSalary, setNewEmployeeSalary] = useState("");
  const [newEmployeeWorkDays, setNewEmployeeWorkDays] = useState("22");

  // Controle de expansão dos custos fixos
  const [showFixedCosts, setShowFixedCosts] = useState(true);

  // Estados calculados
  const [costPerUnit, setCostPerUnit] = useState(0);
  const [markup, setMarkup] = useState(0);
  const [suggestedPrice, setSuggestedPrice] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
  const [breakEven, setBreakEven] = useState(0);
  const [totalFixedCosts, setTotalFixedCosts] = useState(0);

  // Produtos salvos
  const [savedProducts, setSavedProducts] = useState<SavedProduct[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Calcular custo real do funcionário
  const calculateEmployeeCost = (salary: string, workDays: string = "22") => {
    const salaryValue = parseFloat(salary) || 0;
    
    // Encargos obrigatórios
    const inss = salaryValue * 0.20; // INSS Patronal (20%)
    const fgts = salaryValue * 0.08; // FGTS (8%)
    const vacation = salaryValue * (1/12) * (1 + 1/3); // Férias + 1/3 rateado
    const thirteenthSalary = salaryValue * (1/12); // 13º Salário rateado
    const rat = salaryValue * 0.03; // RAT (3%)
    const educationSalary = salaryValue * 0.025; // Salário Educação (2,5%)
    const systemS = salaryValue * 0.0358; // Sistema S (3,58%)

    // Custo mensal total (soma de todos os encargos + salário)
    const monthlyCost = salaryValue + inss + fgts + vacation + thirteenthSalary + rat + educationSalary + systemS;
    
    return monthlyCost;
  };

  // Calcular total de custos fixos
  const calculateTotalFixedCosts = () => {
    // Soma dos custos fixos do formulário
    const costsSum = Object.values(fixedCosts).reduce((sum, value) => {
      return sum + (parseFloat(value) || 0);
    }, 0);

    // Soma dos custos de funcionários
    const employeesCostsSum = employees.reduce((sum, employee) => {
      return sum + calculateEmployeeCost(employee.salary, employee.workDays);
    }, 0);

    return costsSum + employeesCostsSum;
  };

  useEffect(() => {
    const total = calculateTotalFixedCosts();
    setTotalFixedCosts(total);
  }, [fixedCosts, employees]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    calculatePricing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cost, totalFixedCosts, expectedSales, variableExpenses, taxRate, desiredMargin]);

  const calculatePricing = () => {
    const costValue = parseFloat(cost) || 0;
    const expectedSalesValue = parseFloat(expectedSales) || 1;
    const variableExpensesValue = parseFloat(variableExpenses) || 0;
    const taxRateValue = parseFloat(taxRate) || 0;
    const desiredMarginValue = parseFloat(desiredMargin) || 0;

    // Custo por unidade (inclui rateio dos custos fixos)
    const fixedCostPerUnit = totalFixedCosts / expectedSalesValue;
    const totalCostPerUnit = costValue + fixedCostPerUnit;
    setCostPerUnit(totalCostPerUnit);

    // Cálculo do preço de venda
    // Fórmula: Preço = Custo / (1 - (Impostos% + Despesas% + Margem%)/100)
    const totalPercentages = taxRateValue + variableExpensesValue + desiredMarginValue;
    const divisor = 1 - (totalPercentages / 100);
    
    const calculatedPrice = divisor > 0 ? totalCostPerUnit / divisor : 0;
    setSuggestedPrice(calculatedPrice);

    // Markup
    const calculatedMarkup = costValue > 0 ? ((calculatedPrice - costValue) / costValue) * 100 : 0;
    setMarkup(calculatedMarkup);

    // Lucro líquido por unidade
    const taxes = calculatedPrice * (taxRateValue / 100);
    const expenses = calculatedPrice * (variableExpensesValue / 100);
    const profit = calculatedPrice - totalCostPerUnit - taxes - expenses;
    setNetProfit(profit);

    // Break-even (quantas vendas para cobrir custos fixos)
    const breakEvenUnits = profit > 0 ? totalFixedCosts / profit : 0;
    setBreakEven(breakEvenUnits);
  };

  const handleFixedCostChange = (key: keyof FixedCosts, value: string) => {
    setFixedCosts(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAddEmployee = () => {
    if (!newEmployeeSalary) {
      toast.error("Digite o salário do funcionário");
      return;
    }

    const newEmployee: Employee = {
      id: Date.now().toString(),
      salary: newEmployeeSalary,
      workDays: newEmployeeWorkDays,
    };

    setEmployees([...employees, newEmployee]);
    toast.success("Funcionário adicionado!");
    
    // Limpar formulário
    setNewEmployeeSalary("");
    setNewEmployeeWorkDays("22");
    setShowEmployeeForm(false);
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees(employees.filter(e => e.id !== id));
    toast.success("Funcionário removido");
  };

  const handleSaveProduct = () => {
    if (!productName.trim()) {
      toast.error("Digite o nome do produto/serviço");
      return;
    }

    const newProduct: SavedProduct = {
      id: Date.now().toString(),
      name: productName,
      cost: parseFloat(cost) || 0,
      finalPrice: suggestedPrice,
      margin: parseFloat(desiredMargin) || 0,
    };

    setSavedProducts([...savedProducts, newProduct]);
    toast.success("Produto salvo com sucesso!");
    
    // Limpar formulário
    setProductName("");
    setCost("");
  };

  const handleDeleteProduct = (id: string) => {
    setSavedProducts(savedProducts.filter(p => p.id !== id));
    toast.success("Produto removido");
  };

  if (status === "loading") {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
            <Calculator className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-theme">Precificação Inteligente</h1>
            <p className="text-theme-muted">Calcule o preço ideal considerando TODOS os seus custos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário de entrada */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Dados do Produto/Serviço
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Nome do Produto/Serviço</Label>
                    <Input
                      id="productName"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="Ex: Consultoria Empresarial"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productType">Tipo</Label>
                    <Select value={productType} onValueChange={(v: any) => setProductType(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="product">Produto</SelectItem>
                        <SelectItem value="service">Serviço</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cost">Custo Direto (R$)</Label>
                    <Input
                      id="cost"
                      type="number"
                      step="0.01"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      placeholder="0.00"
                    />
                    <p className="text-xs text-theme-muted">
                      {productType === "product" ? "Custo de aquisição ou produção" : "Custo de execução do serviço"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expectedSales">Vendas Esperadas (mês)</Label>
                    <Input
                      id="expectedSales"
                      type="number"
                      value={expectedSales}
                      onChange={(e) => setExpectedSales(e.target.value)}
                      placeholder="0"
                    />
                    <p className="text-xs text-theme-muted">Para rateio dos custos fixos</p>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="variableExpenses">Despesas Variáveis (%)</Label>
                    <Input
                      id="variableExpenses"
                      type="number"
                      step="0.1"
                      value={variableExpenses}
                      onChange={(e) => setVariableExpenses(e.target.value)}
                      placeholder="5"
                    />
                    <p className="text-xs text-theme-muted">Comissões, embalagens, frete, taxas de cartão, etc.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Custos Fixos Detalhados */}
            <Card>
              <CardHeader className="cursor-pointer" onClick={() => setShowFixedCosts(!showFixedCosts)}>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Custos Fixos Mensais (Total: R$ {totalFixedCosts.toFixed(2)})
                  </div>
                  {showFixedCosts ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </CardTitle>
              </CardHeader>
              {showFixedCosts && (
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="aluguel" className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        Aluguel
                      </Label>
                      <Input
                        id="aluguel"
                        type="number"
                        step="0.01"
                        value={fixedCosts.aluguel}
                        onChange={(e) => handleFixedCostChange("aluguel", e.target.value)}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="energia" className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-accent" />
                        Energia Elétrica
                      </Label>
                      <Input
                        id="energia"
                        type="number"
                        step="0.01"
                        value={fixedCosts.energia}
                        onChange={(e) => handleFixedCostChange("energia", e.target.value)}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="internet" className="flex items-center gap-2">
                        <Wifi className="h-4 w-4 text-primary" />
                        Internet
                      </Label>
                      <Input
                        id="internet"
                        type="number"
                        step="0.01"
                        value={fixedCosts.internet}
                        onChange={(e) => handleFixedCostChange("internet", e.target.value)}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telefone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-green-600" />
                        Telefone
                      </Label>
                      <Input
                        id="telefone"
                        type="number"
                        step="0.01"
                        value={fixedCosts.telefone}
                        onChange={(e) => handleFixedCostChange("telefone", e.target.value)}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="agua" className="flex items-center gap-2">
                        <Droplet className="h-4 w-4 text-primary" />
                        Água
                      </Label>
                      <Input
                        id="agua"
                        type="number"
                        step="0.01"
                        value={fixedCosts.agua}
                        onChange={(e) => handleFixedCostChange("agua", e.target.value)}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gas">Gás</Label>
                      <Input
                        id="gas"
                        type="number"
                        step="0.01"
                        value={fixedCosts.gas}
                        onChange={(e) => handleFixedCostChange("gas", e.target.value)}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="iptu">IPTU</Label>
                      <Input
                        id="iptu"
                        type="number"
                        step="0.01"
                        value={fixedCosts.iptu}
                        onChange={(e) => handleFixedCostChange("iptu", e.target.value)}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="condominio">Condomínio</Label>
                      <Input
                        id="condominio"
                        type="number"
                        step="0.01"
                        value={fixedCosts.condominio}
                        onChange={(e) => handleFixedCostChange("condominio", e.target.value)}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contabilidade">Contabilidade</Label>
                      <Input
                        id="contabilidade"
                        type="number"
                        step="0.01"
                        value={fixedCosts.contabilidade}
                        onChange={(e) => handleFixedCostChange("contabilidade", e.target.value)}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="marketing">Marketing/Publicidade</Label>
                      <Input
                        id="marketing"
                        type="number"
                        step="0.01"
                        value={fixedCosts.marketing}
                        onChange={(e) => handleFixedCostChange("marketing", e.target.value)}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="software">Software/Sistemas</Label>
                      <Input
                        id="software"
                        type="number"
                        step="0.01"
                        value={fixedCosts.software}
                        onChange={(e) => handleFixedCostChange("software", e.target.value)}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="seguro">Seguros</Label>
                      <Input
                        id="seguro"
                        type="number"
                        step="0.01"
                        value={fixedCosts.seguro}
                        onChange={(e) => handleFixedCostChange("seguro", e.target.value)}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="manutencao">Manutenção</Label>
                      <Input
                        id="manutencao"
                        type="number"
                        step="0.01"
                        value={fixedCosts.manutencao}
                        onChange={(e) => handleFixedCostChange("manutencao", e.target.value)}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gasolina" className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-red-600" />
                        Gasolina/Combustível
                      </Label>
                      <Input
                        id="gasolina"
                        type="number"
                        step="0.01"
                        value={fixedCosts.gasolina}
                        onChange={(e) => handleFixedCostChange("gasolina", e.target.value)}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="outros">Outros Custos Fixos</Label>
                      <Input
                        id="outros"
                        type="number"
                        step="0.01"
                        value={fixedCosts.outros}
                        onChange={(e) => handleFixedCostChange("outros", e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Funcionários */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Funcionários (Custo Real com Encargos)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {employees.length > 0 && (
                  <div className="space-y-2">
                    {employees.map((employee) => (
                      <div key={employee.id} className="flex items-center justify-between p-3 bg-primary bg-opacity-5 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium">Salário: R$ {parseFloat(employee.salary).toFixed(2)}</p>
                          <p className="text-xs text-theme-muted">
                            Custo Total: R$ {calculateEmployeeCost(employee.salary, employee.workDays).toFixed(2)}/mês
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEmployee(employee.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {!showEmployeeForm ? (
                  <Button 
                    onClick={() => setShowEmployeeForm(true)}
                    variant="outline"
                    className="w-full"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Adicionar Funcionário
                  </Button>
                ) : (
                  <div className="space-y-3 p-4 border border-primary border-opacity-30 rounded-lg bg-primary bg-opacity-5">
                    <div className="space-y-2">
                      <Label htmlFor="newEmployeeSalary">Salário Bruto (R$)</Label>
                      <Input
                        id="newEmployeeSalary"
                        type="number"
                        step="0.01"
                        value={newEmployeeSalary}
                        onChange={(e) => setNewEmployeeSalary(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newEmployeeWorkDays">Dias Trabalhados/Mês</Label>
                      <Input
                        id="newEmployeeWorkDays"
                        type="number"
                        value={newEmployeeWorkDays}
                        onChange={(e) => setNewEmployeeWorkDays(e.target.value)}
                        placeholder="22"
                      />
                    </div>

                    {newEmployeeSalary && (
                      <div className="bg-card border border-primary border-opacity-40 rounded p-3">
                        <p className="text-sm font-semibold text-primary">
                          Custo Real: R$ {calculateEmployeeCost(newEmployeeSalary, newEmployeeWorkDays).toFixed(2)}/mês
                        </p>
                        <p className="text-xs text-theme-muted mt-1">
                          Inclui: INSS (20%), FGTS (8%), RAT (3%), Salário Educação (2,5%), Sistema S (3,58%), Férias, 13º
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button onClick={handleAddEmployee} className="flex-1">
                        Adicionar
                      </Button>
                      <Button 
                        onClick={() => {
                          setShowEmployeeForm(false);
                          setNewEmployeeSalary("");
                          setNewEmployeeWorkDays("22");
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}

                <div className="bg-primary bg-opacity-5 border border-primary border-opacity-30 rounded-lg p-4">
                  <div className="flex gap-2">
                    <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-primary">
                      <strong>Cálculo Automático:</strong> O sistema calcula automaticamente todos os encargos trabalhistas 
                      (INSS, FGTS, férias, 13º, RAT, etc.) para mostrar o custo REAL do funcionário.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Impostos e Margem
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="taxRegime">Regime Tributário</Label>
                    <Select value={taxRegime} onValueChange={setTaxRegime}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simples_nacional">Simples Nacional</SelectItem>
                        <SelectItem value="lucro_presumido">Lucro Presumido</SelectItem>
                        <SelectItem value="lucro_real">Lucro Real</SelectItem>
                        <SelectItem value="mei">MEI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Alíquota de Impostos (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      step="0.1"
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                      placeholder="6"
                    />
                    <p className="text-xs text-theme-muted">
                      {taxRegime === "simples_nacional" && "Anexo I: 4-6% | Anexo III: 6-17.5%"}
                      {taxRegime === "mei" && "DAS MEI: 0%"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="desiredMargin">Margem de Lucro (%)</Label>
                    <Input
                      id="desiredMargin"
                      type="number"
                      step="0.1"
                      value={desiredMargin}
                      onChange={(e) => setDesiredMargin(e.target.value)}
                      placeholder="30"
                    />
                    <p className="text-xs text-theme-muted">Lucro líquido desejado</p>
                  </div>
                </div>

                <div className="bg-primary bg-opacity-5 border border-primary border-opacity-30 rounded-lg p-4">
                  <div className="flex gap-2">
                    <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-primary">
                      <strong>Dica:</strong> A margem de lucro varia por segmento. Comércio: 20-40%, Serviços: 30-50%, 
                      Indústria: 15-30%. Sempre considere a concorrência e o valor percebido pelo cliente.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resultados */}
          <div className="space-y-6">
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <DollarSign className="h-5 w-5" />
                  Preço Sugerido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-600 mb-4">
                  R$ {suggestedPrice.toFixed(2)}
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-theme-muted">Custo direto:</span>
                    <span className="font-semibold">R$ {parseFloat(cost || "0").toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-theme-muted">Custos fixos totais:</span>
                    <span className="font-semibold">R$ {totalFixedCosts.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-theme-muted">Custo por unidade:</span>
                    <span className="font-semibold">R$ {costPerUnit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-theme-muted">Markup:</span>
                    <span className="font-semibold text-primary">{markup.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-theme-muted">Lucro por venda:</span>
                    <span className="font-semibold text-green-600">R$ {netProfit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-theme-muted">Break-even:</span>
                    <span className="font-semibold">{breakEven.toFixed(0)} vendas</span>
                  </div>
                </div>

                <Button onClick={handleSaveProduct} className="w-full mt-4" variant="default">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Produto
                </Button>
              </CardContent>
            </Card>

            {savedProducts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Produtos Salvos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {savedProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-2 bg-muted-soft rounded">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-theme-muted">R$ {product.finalPrice.toFixed(2)}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Detalhamento do cálculo */}
        <Card>
          <CardHeader>
            <CardTitle>Composição do Preço</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-theme-muted mb-1">Custo</p>
                <p className="text-xl font-bold text-orange-600">
                  {suggestedPrice > 0 ? ((costPerUnit / suggestedPrice) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-theme-muted mb-1">Impostos</p>
                <p className="text-xl font-bold text-red-600">{taxRate}%</p>
              </div>
              <div className="text-center p-4 bg-accent bg-opacity-10 rounded-lg">
                <p className="text-sm text-theme-muted mb-1">Despesas</p>
                <p className="text-xl font-bold text-accent">{variableExpenses}%</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-theme-muted mb-1">Lucro</p>
                <p className="text-xl font-bold text-green-600">{desiredMargin}%</p>
              </div>
              <div className="text-center p-4 bg-primary bg-opacity-5 rounded-lg">
                <p className="text-sm text-theme-muted mb-1">Total</p>
                <p className="text-xl font-bold text-primary">100%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
