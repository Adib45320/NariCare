import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Calendar, Package, TrendingUp, Heart, Shield } from "lucide-react";
import { Session, User } from "@supabase/supabase-js";
import PeriodTrackerForm from "@/components/dashboard/PeriodTrackerForm";
import CalendarView from "@/components/dashboard/CalendarView";
import ProductRecommendations from "@/components/dashboard/ProductRecommendations";
import OrderHistory from "@/components/dashboard/OrderHistory";

const Dashboard = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [periodData, setPeriodData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (!currentSession) {
          navigate("/login");
        } else {
          // Defer profile fetching with setTimeout
          setTimeout(() => {
            fetchProfile(currentSession.user.id);
            fetchPeriodData(currentSession.user.id);
            checkActiveSubscription(currentSession.user.id);
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (!currentSession) {
        navigate("/login");
      } else {
        setTimeout(() => {
          fetchProfile(currentSession.user.id);
          fetchPeriodData(currentSession.user.id);
          checkActiveSubscription(currentSession.user.id);
        }, 0);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
    } else {
      setProfile(data);
    }

    // Check admin status
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    setIsAdmin(!!roles);
  };

  const fetchPeriodData = async (userId: string) => {
    const { data, error } = await supabase
      .from("period_data")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching period data:", error);
    } else {
      setPeriodData(data || []);
    }
  };

  const checkActiveSubscription = async (userId: string) => {
    const { data } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .in("status", ["active", "not_verified"])
      .maybeSingle();

    setHasActiveSubscription(!!data);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logged out",
        description: "See you soon! 💕",
      });
      navigate("/");
    }
  };

  const handleDataUpdate = () => {
    if (user) {
      fetchPeriodData(user.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Header */}
      <div className="border-b bg-background/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome, {profile?.full_name || "User"} 💕
            </h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <Button variant="secondary" onClick={() => navigate("/admin")}>
                <Shield className="mr-2 h-4 w-4" />
                Admin
              </Button>
            )}
            {hasActiveSubscription ? (
              <Button variant="cta" onClick={() => navigate("/subscription-manage")}>
                <Heart className="mr-2 h-4 w-4" />
                Manage Subscription
              </Button>
            ) : (
              <Button variant="cta" onClick={() => navigate("/subscribe")}>
                <Heart className="mr-2 h-4 w-4" />
                Subscribe
              </Button>
            )}
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8">
          {/* Period Tracker Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold">AI Period Tracker</h2>
            </div>
            {periodData.length === 0 ? (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 text-center">
                <p className="text-lg mb-4">
                  📅 No data yet. Track your first cycle below!
                </p>
              </div>
            ) : (
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  {periodData.length} cycle{periodData.length !== 1 ? "s" : ""} tracked
                </p>
              </div>
            )}
            <PeriodTrackerForm userId={user.id} onDataUpdate={handleDataUpdate} />
          </section>

          {/* Calendar View */}
          {periodData.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold">Your Cycle Calendar</h2>
              </div>
              <CalendarView periodData={periodData} />
            </section>
          )}

          {/* Product Recommendations */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold">Recommended for You 🌸</h2>
            </div>
            <ProductRecommendations 
              nextPeriodDate={periodData[0]?.next_period_date} 
              userId={user.id}
            />
          </section>

          {/* Order History */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Order History</h2>
            <OrderHistory userId={user.id} />
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
