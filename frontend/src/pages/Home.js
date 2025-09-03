import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Users, Star, Clock, MapPin, Utensils } from 'lucide-react';

const Home = () => {
  const { user, isCustomer, isStaff } = useAuth();

  const features = [
    {
      icon: Calendar,
      title: 'Easy Booking',
      description: 'Book your table in seconds with our intuitive reservation system'
    },
    {
      icon: Users,
      title: 'Group Dining',
      description: 'Perfect for parties of any size with flexible table arrangements'
    },
    {
      icon: Star,
      title: 'Premium Experience',
      description: 'Enjoy exceptional service and ambiance in our carefully designed spaces'
    },
    {
      icon: Clock,
      title: 'Real-time Updates',
      description: 'Get instant confirmation and real-time availability updates'
    },
    {
      icon: MapPin,
      title: 'Multiple Locations',
      description: 'Choose from indoor, outdoor, or private dining areas'
    },
    {
      icon: Utensils,
      title: 'Special Requests',
      description: 'We accommodate dietary needs and special occasions'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-shadow">
            Reserve Your Perfect Table
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
            Experience fine dining at its best. Book your table online and enjoy a seamless reservation experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <>
                <Link
                  to="/timeslots"
                  className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg"
                >
                  Book Now
                </Link>
                <Link
                  to="/register"
                  className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 text-lg"
                >
                  Create Account
                </Link>
              </>
            ) : isCustomer() ? (
              <Link
                to="/dashboard"
                className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to="/staff"
                className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg"
              >
                Staff Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Reservation System?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We've designed every aspect of the booking experience to be simple, efficient, and enjoyable.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center hover:shadow-lg transition-shadow duration-300">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Getting your perfect table is just three simple steps away.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Browse Available Slots</h3>
              <p className="text-gray-600">
                View real-time availability for dates, times, and table configurations that suit your needs.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Select & Book</h3>
              <p className="text-gray-600">
                Choose your preferred time slot, specify party size, and add any special requests.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Confirmation</h3>
              <p className="text-gray-600">
                Receive instant confirmation and manage your reservation through your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Experience Fine Dining?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust our reservation system for their dining needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <>
                <Link
                  to="/timeslots"
                  className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg"
                >
                  Start Booking
                </Link>
                <Link
                  to="/register"
                  className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 text-lg"
                >
                  Sign Up Free
                </Link>
              </>
            ) : (
              <Link
                to={isCustomer() ? "/dashboard" : "/staff"}
                className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg"
              >
                {isCustomer() ? "Go to Dashboard" : "Staff Dashboard"}
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
