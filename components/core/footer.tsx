"use client"

import Link from "next/link"
import { Github, Twitter, Linkedin, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/20 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-bold text-lg mb-4">DOTVEST</h3>
            <p className="text-sm text-muted-foreground">Premium Polkadot DeFi aggregator powered by AI</p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">
                  Aggregator
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">
                  Bridge
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">
                  Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">
                  API Reference
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>&copy; 2025 DOTVEST. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
