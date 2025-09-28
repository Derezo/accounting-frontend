import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  DollarSign,
  Users,
  FileText,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";

const Index = () => {
  // Mock data for the dashboard
  const kpiData = [
    {
      title: "Total Revenue",
      value: "$124,590",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      description: "vs last month"
    },
    {
      title: "Active Clients",
      value: "248",
      change: "+8.2%",
      trend: "up",
      icon: Users,
      description: "vs last month"
    },
    {
      title: "Pending Invoices",
      value: "23",
      change: "-5.1%",
      trend: "down",
      icon: FileText,
      description: "vs last month"
    },
    {
      title: "Outstanding Payments",
      value: "$18,450",
      change: "-12.3%",
      trend: "down",
      icon: CreditCard,
      description: "vs last month"
    }
  ];

  const recentInvoices = [
    { id: "INV-001", client: "Tech Corp Ltd", amount: "$2,500", status: "paid", date: "2 days ago" },
    { id: "INV-002", client: "Marketing Plus", amount: "$1,800", status: "pending", date: "5 days ago" },
    { id: "INV-003", client: "Design Studio", amount: "$3,200", status: "overdue", date: "1 week ago" },
    { id: "INV-004", client: "StartupXYZ", amount: "$950", status: "paid", date: "2 weeks ago" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="status-success">Paid</Badge>;
      case 'pending':
        return <Badge className="status-warning">Pending</Badge>;
      case 'overdue':
        return <Badge className="status-error">Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-10"></div>
        <div className="relative max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Professional Accounting Dashboard
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Streamline your financial operations with our comprehensive accounting management system
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="gradient-animate">
              <BarChart3 className="mr-2 h-5 w-5" />
              View Analytics
            </Button>
            <Button variant="outline" size="lg" className="hover-lift">
              <FileText className="mr-2 h-5 w-5" />
              Create Invoice
            </Button>
          </div>
        </div>
      </section>

      {/* KPI Cards Section */}
      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Financial Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpiData.map((kpi, index) => {
              const Icon = kpi.icon;
              return (
                <Card key={index} className="financial-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {kpi.title}
                    </CardTitle>
                    <Icon className="h-5 w-5 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-1">{kpi.value}</div>
                    <div className="flex items-center text-sm">
                      {kpi.trend === 'up' ? (
                        <ArrowUpRight className="h-4 w-4 text-success mr-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-destructive mr-1" />
                      )}
                      <span className={kpi.trend === 'up' ? 'text-success' : 'text-destructive'}>
                        {kpi.change}
                      </span>
                      <span className="text-muted-foreground ml-1">{kpi.description}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dashboard Tabs */}
      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="invoices">Recent Invoices</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="financial-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Revenue Growth
                    </CardTitle>
                    <CardDescription>Monthly revenue progression</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">This Month</span>
                        <span className="text-sm text-muted-foreground">$124,590</span>
                      </div>
                      <Progress value={75} className="h-2" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Last Month</span>
                        <span className="text-sm text-muted-foreground">$110,720</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="financial-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription>Frequently used features</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start hover-lift">
                      <FileText className="mr-2 h-4 w-4" />
                      Create New Invoice
                    </Button>
                    <Button variant="outline" className="w-full justify-start hover-lift">
                      <Users className="mr-2 h-4 w-4" />
                      Add New Client
                    </Button>
                    <Button variant="outline" className="w-full justify-start hover-lift">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Generate Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start hover-lift">
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Payment
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="invoices" className="space-y-6">
              <Card className="financial-card">
                <CardHeader>
                  <CardTitle>Recent Invoices</CardTitle>
                  <CardDescription>
                    Latest invoices and their payment status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentInvoices.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover-lift">
                        <div className="flex flex-col space-y-1">
                          <span className="font-medium">{invoice.id}</span>
                          <span className="text-sm text-muted-foreground">{invoice.client}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="font-semibold">{invoice.amount}</span>
                          {getStatusBadge(invoice.status)}
                          <span className="text-sm text-muted-foreground">{invoice.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card className="financial-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-primary" />
                    Financial Analytics
                  </CardTitle>
                  <CardDescription>
                    Detailed insights into your financial performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Advanced Analytics Coming Soon</h3>
                    <p className="text-muted-foreground">
                      Interactive charts and detailed financial analytics will be available here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <Card className="financial-card">
                <CardHeader>
                  <CardTitle>Financial Reports</CardTitle>
                  <CardDescription>
                    Generate and download comprehensive reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Report Generation</h3>
                    <p className="text-muted-foreground">
                      Comprehensive reporting tools will be available here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Powerful Accounting Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage your business finances professionally
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="financial-card text-center">
              <CardHeader>
                <DollarSign className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Invoice Management</CardTitle>
                <CardDescription>
                  Create, send, and track professional invoices with automated reminders
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="financial-card text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Client Management</CardTitle>
                <CardDescription>
                  Organize customer information and track payment history
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="financial-card text-center">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Financial Analytics</CardTitle>
                <CardDescription>
                  Real-time insights and reports to make informed business decisions
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;