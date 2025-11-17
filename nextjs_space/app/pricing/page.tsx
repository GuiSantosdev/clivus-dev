
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProtectedLayout } from "@/components/protected-layout";
import { Calculator, DollarSign, TrendingUp, Package, AlertCircle, Save, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface SavedProduct {
  id: string;
  name: string;
  cost: number;
  finalPrice: number;
  margin: number;
}

export default function PricingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Estados do formulário
  const [productName, setProductName] = useState("");
  const [productType, setProductType] = useState<"product" | "service">("product");
  const [cost, setCost] = useState("");
  const [fixedCosts, setFixedCosts] = useState("");
  const [expectedSales, setExpectedSales] = useState("");
  const [variableExpenses, setVariableExpenses] = useState("5");
  const [taxRegime, setTaxRegime] = useState("simples_nacional");
  const [taxRate, setTaxRate] = useState("6");
  const [desiredMargin, setDesiredMargin] = useState("30");

  // Estados calculados
  const [costPerUnit, setCostPerUnit] = useState(0);
  const [markup, setMarkup] = useState(0);
  const [suggestedPrice, setSuggestedPrice] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
  const [breakEven, setBreakEven] = useState(0);

  // Produtos salvos
  const [savedProducts, setSavedProducts] = useState<SavedProduct[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    calculatePricing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cost, fixedCosts, expectedSales, variableExpenses, taxRate, desiredMargin]);

  const calculatePricing = () => {
    const costValue = parseFloat(cost) || 0;
    const fixedCostsValue = parseFloat(fixedCosts) || 0;
    const expectedSalesValue = parseFloat(expectedSales) || 1;
    const variableExpensesValue = parseFloat(variableExpenses) || 0;
    const taxRateValue = parseFloat(taxRate) || 0;
    const desiredMarginValue = parseFloat(desiredMargin) || 0;

    // Custo por unidade (inclui rateio dos custos fixos)
    const fixedCostPerUnit = fixedCostsValue / expectedSalesValue;
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
    const breakEvenUnits = profit > 0 ? fixedCostsValue / profit : 0;
    setBreakEven(breakEvenUnits);
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
      <ProtectedLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
            <Calculator className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Precificação Inteligente</h1>
            <p className="text-gray-600">Calcule o preço ideal para seus produtos e serviços</p>
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
                    <p className="text-xs text-gray-500">
                      {productType === "product" ? "Custo de aquisição ou produção" : "Custo de execução do serviço"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fixedCosts">Custos Fixos Mensais (R$)</Label>
                    <Input
                      id="fixedCosts"
                      type="number"
                      step="0.01"
                      value={fixedCosts}
                      onChange={(e) => setFixedCosts(e.target.value)}
                      placeholder="0.00"
                    />
                    <p className="text-xs text-gray-500">Aluguel, salários, contas, etc.</p>
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
                    <p className="text-xs text-gray-500">Para rateio dos custos fixos</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="variableExpenses">Despesas Variáveis (%)</Label>
                    <Input
                      id="variableExpenses"
                      type="number"
                      step="0.1"
                      value={variableExpenses}
                      onChange={(e) => setVariableExpenses(e.target.value)}
                      placeholder="5"
                    />
                    <p className="text-xs text-gray-500">Comissões, embalagens, frete, etc.</p>
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
                    <p className="text-xs text-gray-500">
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
                    <p className="text-xs text-gray-500">Lucro líquido desejado</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
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
                    <span className="text-gray-600">Custo por unidade:</span>
                    <span className="font-semibold">R$ {costPerUnit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Markup:</span>
                    <span className="font-semibold text-blue-600">{markup.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lucro por venda:</span>
                    <span className="font-semibold text-green-600">R$ {netProfit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Break-even:</span>
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
                    <div key={product.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-gray-600">R$ {product.finalPrice.toFixed(2)}</p>
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
                <p className="text-sm text-gray-600 mb-1">Custo</p>
                <p className="text-xl font-bold text-orange-600">
                  {suggestedPrice > 0 ? ((costPerUnit / suggestedPrice) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Impostos</p>
                <p className="text-xl font-bold text-red-600">{taxRate}%</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Despesas</p>
                <p className="text-xl font-bold text-yellow-600">{variableExpenses}%</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Lucro</p>
                <p className="text-xl font-bold text-green-600">{desiredMargin}%</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total</p>
                <p className="text-xl font-bold text-blue-600">100%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  );
}
