import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, FileText, Heart, Shield, Activity, ChevronRight, Star } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Navbar Placeholder */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="text-2xl font-bold tracking-tight text-primary">ChronoMed</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">How it Works</a>
            <a href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">Testimonials</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/auth/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link to="/auth/register">
              <Button>Sign up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-teal-50 to-slate-100 pt-24 pb-32">
          {/* Animated gradient mesh placeholder (CSS driven) */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-teal-100/50 via-transparent to-transparent" />
          
          <div className="container relative z-10 px-4 md:px-8 mx-auto flex flex-col items-center text-center">
            <Badge variant="secondary" className="mb-6 py-1.5 px-4 text-sm bg-teal-100 text-teal-800 hover:bg-teal-100">
              Introducing Smart Queue Management
            </Badge>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 max-w-4xl">
              The Future of Medical Channeling is Here.
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-2xl leading-relaxed">
              AI-powered queue management, real-time updates, and zero waiting room surprises. Your Time. Your Health. Perfected.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <Link to="/auth/register">
                <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 rounded-full shadow-lg shadow-teal-500/25">
                  Book Appointment
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth/register?role=hospital">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 rounded-full border-2">
                  For Hospitals
                </Button>
              </Link>
            </div>

            {/* Stat Counters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-4xl mx-auto border-t border-slate-200/60 pt-12">
              <div className="flex flex-col items-center">
                <span className="text-4xl font-bold text-teal-700 mb-2">50,000+</span>
                <span className="text-slate-500 font-medium">Appointments</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-4xl font-bold text-teal-700 mb-2">200+</span>
                <span className="text-slate-500 font-medium">Doctors</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-4xl font-bold text-teal-700 mb-2">98%</span>
                <span className="text-slate-500 font-medium">On-Time Rate</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white">
          <div className="container px-4 md:px-8 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why ChronoMed?</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">Experience healthcare that respects your time with our cutting-edge features.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: "AI Wait Time Prediction", icon: Clock, desc: "Machine learning algorithms predict your exact wait time with high accuracy." },
                { title: "Real-Time Queue Updates", icon: Activity, desc: "Track your position in the queue live from your smartphone." },
                { title: "Digital Prescriptions", icon: FileText, desc: "Receive and store secure digital prescriptions directly in your app." },
                { title: "Multi-Portal Ecosystem", icon: Shield, desc: "Dedicated interfaces for patients, doctors, and hospital administrators." },
                { title: "Smart Notifications", icon: Heart, desc: "Get SMS, Email, and Push alerts for delays, turn arrivals, and more." },
                { title: "Secure Health Records", icon: Calendar, desc: "Your complete medical history, accessible anytime, completely secure." },
              ].map((feature, i) => (
                <Card key={i} className="border-0 shadow-lg shadow-slate-100 hover:shadow-xl transition-all duration-300 group cursor-pointer hover:-translate-y-1">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-teal-50 flex items-center justify-center mb-4 group-hover:bg-teal-500 transition-colors duration-300">
                      <feature.icon className="h-6 w-6 text-teal-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-24 bg-slate-50">
          <div className="container px-4 md:px-8 mx-auto">
             <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Patients Say</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-white border-0 shadow-md">
                  <CardContent className="p-8">
                    <div className="flex gap-1 mb-6">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-5 w-5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-slate-700 italic mb-6">"ChronoMed completely changed how I visit the doctor. I knew exactly when to leave my house and waited less than 5 minutes at the hospital!"</p>
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-slate-200" />
                      <div>
                        <h4 className="font-semibold text-slate-900">Sarah M.</h4>
                        <p className="text-sm text-slate-500">Patient at Nawaloka</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
        <div className="container px-4 md:px-8 mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Activity className="h-6 w-6 text-teal-500" />
              <span className="text-2xl font-bold text-white">ChronoMed</span>
            </div>
            <p className="text-slate-400 text-sm">Your Time. Your Health. Perfected.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">For Hospitals</a></li>
              <li><a href="#" className="hover:text-white transition-colors">For Doctors</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="container px-4 md:px-8 mx-auto mt-12 pt-8 border-t border-slate-800 text-sm text-slate-500 text-center">
          &copy; {new Date().getFullYear()} ChronoMed. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
