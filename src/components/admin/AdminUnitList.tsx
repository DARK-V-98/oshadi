'use client';
import Link from 'next/link';
import { Key, ExternalLink, MessageSquare, Tags, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  return (
    <section id="admin-dashboard" className="py-8 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Manage your application's content and users.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="group relative p-6 rounded-2xl bg-card border border-border shadow-card hover:shadow-soft transition-shadow duration-300">
              <h2 className="font-heading text-2xl font-bold text-foreground">Manage Units & PDFs</h2>
              <p className="text-muted-foreground mt-2 mb-4">Upload and manage PDF files for each unit.</p>
              <Button asChild>
                <Link href="/admin/units">
                    Manage Units
                    <ExternalLink className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
            
            <div className="group relative p-6 rounded-2xl bg-card border border-border shadow-card hover:shadow-soft transition-shadow duration-300">
              <h2 className="font-heading text-2xl font-bold text-foreground">Manage Access Keys</h2>
              <p className="text-muted-foreground mt-2 mb-4">Generate and view one-time access keys for units.</p>
              <Button asChild>
                <Link href="/admin/keys">
                    <Key className="w-4 h-4 mr-2" />
                    Manage Keys
                </Link>
              </Button>
            </div>

            <div className="group relative p-6 rounded-2xl bg-card border border-border shadow-card hover:shadow-soft transition-shadow duration-300">
              <h2 className="font-heading text-2xl font-bold text-foreground">Manage Testimonials</h2>
              <p className="text-muted-foreground mt-2 mb-4">Approve or delete user-submitted testimonials.</p>
              <Button asChild>
                <Link href="/admin/testimonials">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Manage Testimonials
                </Link>
              </Button>
            </div>

            <div className="group relative p-6 rounded-2xl bg-card border border-border shadow-card hover:shadow-soft transition-shadow duration-300">
              <h2 className="font-heading text-2xl font-bold text-foreground">Manage Users</h2>
              <p className="text-muted-foreground mt-2 mb-4">View and manage user roles (admin/user).</p>
              <Button asChild>
                <Link href="/admin/users">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Users
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminDashboard;
