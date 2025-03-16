import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function About() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-[#FF8C69] to-[#FF6347] bg-clip-text text-transparent">
        About SnugglePaws
      </h1>
      
      <div className="max-w-3xl mx-auto grid gap-8">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-neutral-700 mb-4">
              SnugglePaws is dedicated to connecting pet lovers with their perfect companions through an ethical, 
              transparent, and secure marketplace. We believe every pet deserves a loving home and every home deserves 
              the perfect pet companion.
            </p>
            <p className="text-neutral-700">
              Our platform focuses on responsible pet ownership, ethical breeding practices, and creating lasting 
              connections between pets and their new families.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-semibold mb-4">What Makes Us Different</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-[#FF8C69]">Verified Sellers</h3>
                <p className="text-neutral-700">
                  All sellers on our platform undergo a rigorous verification process to ensure they follow ethical 
                  practices in breeding, care, and pet transfer.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-[#FF8C69]">Secure Transactions</h3>
                <p className="text-neutral-700">
                  Our integrated payment system with escrow functionality protects both buyers and sellers, releasing 
                  funds only when both parties are satisfied with the transaction.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-[#FF8C69]">Perfect Match Algorithm</h3>
                <p className="text-neutral-700">
                  Our special matching system helps you find a pet that fits your lifestyle, preferences, and home 
                  environment to ensure a lasting and happy relationship.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-[#FF8C69]">Post-Adoption Support</h3>
                <p className="text-neutral-700">
                  We don't just help with the initial connection - our community forums and resources provide ongoing 
                  support for all aspects of pet ownership.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
            <p className="text-neutral-700 mb-4">
              SnugglePaws was founded in 2023 by a group of passionate pet owners who saw the need for a more 
              ethical and secure platform for pet adoption and sales. After experiencing the challenges and concerns 
              of finding pets through traditional channels, they set out to create a solution that prioritizes animal welfare.
            </p>
            <p className="text-neutral-700">
              Today, SnugglePaws continues to grow with the mission of revolutionizing how people find and adopt pets, 
              ensuring every connection made on our platform is built on trust, transparency, and a genuine love for animals.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}