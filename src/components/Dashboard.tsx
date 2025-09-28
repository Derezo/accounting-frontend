import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Activity,
  Plus
} from "lucide-react";

export const Dashboard = () => {
  const kpiData = [
    {
      title: "Total Revenue",
      value: "$124,590",
      change: "+12.5%",
      trend: "up" as const,
      icon: DollarSign,
      description: "vs last month"
    },
    {
      title: "Active Clients",
      value: "248",
      change: "+8.2%",
      trend: "up" as const,
      icon: Users,
      description: "vs last month"
    },
    {
      title: "Pending Invoices",
      value: "23",
      change: "-5.1%",
      trend: "down" as const,
      icon: FileText,
      description: "vs last month"
    },
    {
      title: "Outstanding Payments",
      value: "$18,450",
      change: "-12.3%",
      trend: "down" as const,
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your financial overview.</p>
        </div>
        <Button className="gradient-animate">
          <Plus className="mr-2 h-4 w-4" />
          New Invoice
        </Button>
      </div>

      {/* KPI Cards */}
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Progress */}
        <Card className="financial-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Revenue Progress
            </CardTitle>
            <CardDescription>Monthly revenue vs targets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">This Month</span>
                  <span className="text-sm text-muted-foreground">$124,590 / $150,000</span>
                </div>
                <Progress value={83} className="h-3" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Last Month</span>
                  <span className="text-sm text-muted-foreground">$110,720 / $140,000</span>
                </div>
                <Progress value={79} className="h-3" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Q1 Target</span>
                  <span className="text-sm text-muted-foreground">$320,450 / $420,000</span>
                </div>
                <Progress value={76} className="h-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
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
              Create Invoice
            </Button>
            <Button variant="outline" className="w-full justify-start hover-lift">
              <Users className="mr-2 h-4 w-4" />
              Add Client
            </Button>
            <Button variant="outline" className="w-full justify-start hover-lift">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Reports
            </Button>
            <Button variant="outline" className="w-full justify-start hover-lift">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Payment
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card className="financial-card">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>Latest invoices and payment status</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
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
    </div>
  );
};