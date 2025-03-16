import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Explore from "@/pages/explore";
import PetDetails from "@/pages/pet-details";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Profile from "@/pages/profile";
import Messages from "@/pages/messages";
import About from "@/pages/about";
import Checkout from "@/pages/checkout";
import Favorites from "@/pages/favorites";
import Layout from "@/components/layout/layout";
import { AuthProvider } from "@/lib/auth";

function Router() {
  const [location] = useLocation();
  
  // Don't apply layout to auth pages
  const noLayoutPaths = ['/login', '/register'];
  
  if (noLayoutPaths.includes(location)) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route component={NotFound} />
      </Switch>
    );
  }
  
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/explore" component={Explore} />
        <Route path="/pet/:id" component={PetDetails} />
        <Route path="/profile" component={Profile} />
        <Route path="/favorites" component={Favorites} />
        <Route path="/messages" component={Messages} />
        <Route path="/about" component={About} />
        <Route path="/checkout" component={Checkout} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
