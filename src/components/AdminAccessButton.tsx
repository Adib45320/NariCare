import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

const AdminAccessButton = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      setIsAdmin(!!roles);
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    }
  };

  return (
    <Button
      onClick={() => navigate("/admin")}
      variant="outline"
      size="sm"
      className="fixed bottom-4 left-4 z-50 shadow-lg hover:shadow-xl transition-all bg-background/80 backdrop-blur-sm"
      title="Admin Panel"
      disabled={!isAdmin}
    >
      <Shield className="h-4 w-4" />
    </Button>
  );
};

export default AdminAccessButton;
