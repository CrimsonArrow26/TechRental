import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Clock, CheckCircle, Users } from 'lucide-react';
import { useInventory } from '../contexts/InventoryContext';
import ProductCard from '../components/product/ProductCard';

const Home: React.FC = () => {
  const { products, isLoading, statistics } = useInventory();
  
  // Get featured products (e.g., first 3 products)
  const featuredProducts = products.slice(0, 3);
  
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-primary-700 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              College Electronics Rental Portal
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8">
              Rent the electronics you need for your college projects. Easy access to components, sensors, and development boards.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/catalog"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white hover:bg-blue-50 transition-colors"
              >
                Browse Catalog
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-primary-600 transition-colors"
              >
                Student Login
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Renting electronics for your college projects has never been easier.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Browse Catalog</h3>
              <p className="text-gray-600">
                Browse our extensive catalog of electronics components available for rental.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Rent Items</h3>
              <p className="text-gray-600">
                Select the items you need and rent them using your student ID.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Return on Time</h3>
              <p className="text-gray-600">
                Use the components for your project and return them by the due date.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Electronics</h2>
            <Link
              to="/catalog"
              className="text-primary-600 hover:text-primary-800 flex items-center text-sm font-medium"
            >
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-16 bg-primary-700 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">Our Impact</h2>
            <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto">
              Helping students access the technology they need for their academic success.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{statistics.totalComponents}</div>
              <p className="text-blue-100">Available Components</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{statistics.activeRentals}</div>
              <p className="text-blue-100">Active Rentals</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{statistics.totalStudents}</div>
              <p className="text-blue-100">Active Students</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{statistics.satisfactionRate}%</div>
              <p className="text-blue-100">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Student Testimonials</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Hear what our students have to say about the rental experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
                  <Users className="h-6 w-6" />
                </div>
                <div className="ml-3">
                  <h4 className="text-lg font-semibold">Alex Johnson</h4>
                  <p className="text-sm text-gray-600">Electrical Engineering</p>
                </div>
              </div>
              <p className="text-gray-600">
                "The rental process is incredibly streamlined. I was able to get the Arduino I needed for my project within minutes."
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
                  <Users className="h-6 w-6" />
                </div>
                <div className="ml-3">
                  <h4 className="text-lg font-semibold">Maria Garcia</h4>
                  <p className="text-sm text-gray-600">Computer Science</p>
                </div>
              </div>
              <p className="text-gray-600">
                "Having access to sensors and components without having to purchase them has saved me so much money throughout my degree."
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
                  <Users className="h-6 w-6" />
                </div>
                <div className="ml-3">
                  <h4 className="text-lg font-semibold">David Kim</h4>
                  <p className="text-sm text-gray-600">Robotics</p>
                </div>
              </div>
              <p className="text-gray-600">
                "The variety of components available for rental is impressive. I've been able to experiment with different sensors for my robotics project."
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary-700 rounded-lg shadow-xl overflow-hidden">
            <div className="px-6 py-12 md:p-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Ready to start your next project?
              </h2>
              <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                Browse our catalog to find the components you need for your college assignments and projects.
              </p>
              <Link
                to="/catalog"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white hover:bg-blue-50 transition-colors"
              >
                Explore Electronics Catalog
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;