import React, { useState, useEffect } from 'react';
import { AlertCircle, Search } from 'lucide-react';
import { useInventory } from '../../contexts/InventoryContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getStudentName } from '../../utils/studentUtils';
import { supabase } from '../../lib/supabaseClient';

interface Student {
  id: string;
  name: string;
  email: string;
  registration_number: string;
  rentals: Array<{
    id: string;
    item: {
      name: string;
      model_number: string | null;
    };
    serial_number: {
      serial_number: string;
    };
    issued_date: string;
    due_date: string;
    status: string;
  }>;
}

interface StudentManagementProps {
  searchQuery: string;
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string | null) => void;
}

const StudentManagement: React.FC<StudentManagementProps> = ({ searchQuery, selectedStudentId, setSelectedStudentId }) => {
  const { products, handleReturnItem, rentProduct } = useInventory();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReturnModal, setShowReturnModal] = useState<string | null>(null);
  const [returnSuccess, setReturnSuccess] = useState<string | null>(null);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  // Rent modal state
  const [rentModalProduct, setRentModalProduct] = useState<any | null>(null);
  const [rentModalSerial, setRentModalSerial] = useState<string>('');
  const [rentModalDueDate, setRentModalDueDate] = useState<Date | null>(null);
  const [renting, setRenting] = useState(false);
  const [rentSuccess, setRentSuccess] = useState<string | null>(null);
  const [showRentModal, setShowRentModal] = useState(false);
  const [studentDetails, setStudentDetails] = useState<any>(null);
  const [studentLoading, setStudentLoading] = useState(false);

  useEffect(() => {
    const studentMap: Record<string, any> = {};
    products.forEach((product: any) => {
      product.rentedSerialNumbers.forEach((rental: any) => {
        if (rental.studentId) {
          if (!studentMap[rental.studentId]) {
            studentMap[rental.studentId] = {
              studentId: rental.studentId,
              studentName: getStudentName(rental.studentId),
              rentals: [],
            };
          }
          studentMap[rental.studentId].rentals.push({
            id: `${product.id}-${rental.serialNumber}`,
            productName: product.name,
            mainCategory: product.mainCategory,
            subCategory: product.subCategory,
            serialNumber: rental.serialNumber,
            issuedDate: rental.issuedDate,
            dueDate: rental.dueDate,
          });
        }
      });
    });
    let studentsArr = Object.values(studentMap).filter((student: any) =>
      student.rentals.length > 0
    );
    const searchTerm = (searchQuery || localSearchQuery).toLowerCase();
    if (searchTerm) {
      studentsArr = studentsArr.filter((student: any) =>
        student.studentName.toLowerCase().includes(searchTerm) ||
        student.studentId.toLowerCase().includes(searchTerm) ||
        student.rentals.some((r: any) =>
          r.serialNumber.toLowerCase().includes(searchTerm)
        )
      );
    }
    setStudents(studentsArr);
    setLoading(false);
  }, [products, searchQuery, localSearchQuery]);

  useEffect(() => {
    if (selectedStudentId) {
      setStudentLoading(true);
      supabase
        .from('students')
        .select('registration_number, name, email, mobile_number')
        .eq('id', selectedStudentId)
        .single()
        .then(({ data }) => setStudentDetails(data))
        .finally(() => setStudentLoading(false));
    }
  }, [selectedStudentId]);

  const handleReturnClick = (rentalId: string) => {
    setShowReturnModal(rentalId);
  };

  const handleReturnConfirm = async (rentalId: string) => {
    try {
      const [productId, serialNumber] = rentalId.split('-');
      handleReturnItem(productId, serialNumber);
      setShowReturnModal(null);
      setReturnSuccess('Item returned successfully');
      setTimeout(() => setReturnSuccess(null), 3000);
      setStudents((prevStudents: any[]) =>
        prevStudents.map((student: any) => ({
          ...student,
          rentals: student.rentals.map((rental: any) =>
            rental.id === rentalId
              ? { ...rental, status: 'returned' }
              : rental
          ),
        }))
      );
    } catch (err) {
      setError('Failed to process return');
    }
  };

  if (loading && students.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!selectedStudentId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Students with Active Rentals</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, ID, or serial number..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registration Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active Rentals
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student: any) => (
                <tr
                  key={student.studentId}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-extrabold text-blue-800">
                    <button
                      className="focus:outline-none hover:underline-none active:underline-none text-blue-800 font-extrabold p-0 bg-transparent border-none cursor-pointer"
                      style={{ textDecoration: 'none' }}
                      onClick={() => setSelectedStudentId(student.studentId)}
                    >
                      {student.studentName}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.registration_number || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.email || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.rentals.length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <button
                      onClick={() => setSelectedStudentId(student.studentId)}
                      className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const student = students.find((s: any) => s.studentId === selectedStudentId);
  const availableProducts = products.filter((p: any) => p.availableQuantity > 0);

  return (
    <div className="space-y-6">
      {/* Student Info Card from Supabase */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-2">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Student Information</h2>
        {studentLoading ? (
          <div>Loading...</div>
        ) : studentDetails ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-gray-500 font-medium">EN Number:</span>
              <span className="ml-2 text-gray-900">{studentDetails.registration_number}</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">Mobile Number:</span>
              <span className="ml-2 text-gray-900">{studentDetails.mobile_number}</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">Email ID:</span>
              <span className="ml-2 text-gray-900">{studentDetails.email}</span>
            </div>
          </div>
        ) : (
          <div>No student details found.</div>
        )}
      </div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => setSelectedStudentId(null)}
            className="text-primary-600 hover:text-primary-700 mr-4"
          >
            ← Back to Students
          </button>
          <h2 className="text-xl font-semibold text-gray-800">
            {student.studentName}'s Active Rentals
          </h2>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by serial number..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>
      {returnSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <p className="text-green-700">{returnSuccess}</p>
        </div>
      )}
      {rentSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <p className="text-green-700">{rentSuccess}</p>
        </div>
      )}
      {/* Rentals Table Grouped by Main Category with Proper Filtering */}
      {(() => {
        // Group rentals by mainCategory
        const grouped = student.rentals.reduce((acc: any, rental: any) => {
          if (!acc[rental.mainCategory]) acc[rental.mainCategory] = [];
          acc[rental.mainCategory].push(rental);
          return acc;
        }, {});
        return Object.entries(grouped).map(([mainCategory, rentals]) => {
          // Filter rentals for each section
          let filteredRentals = rentals as any[];
          if (mainCategory.toLowerCase().includes('arduino')) {
            filteredRentals = filteredRentals.filter(r =>
              (r.subCategory && r.subCategory.toLowerCase().includes('arduino')) ||
              (r.productName && r.productName.toLowerCase().includes('arduino'))
            );
          } else if (mainCategory.toLowerCase().includes('raspberry')) {
            filteredRentals = filteredRentals.filter(r =>
              (r.subCategory && r.subCategory.toLowerCase().includes('raspberry')) ||
              (r.productName && r.productName.toLowerCase().includes('raspberry'))
            );
          }
          if (filteredRentals.length === 0) return null;
          return (
            <div key={mainCategory} className="mb-8">
              <h3 className="text-lg font-semibold px-6 py-4 border-b bg-gray-50">{mainCategory}</h3>
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Serial Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Issue Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRentals
                      .filter((rental: any) =>
                        !localSearchQuery ||
                        rental.serialNumber.toLowerCase().includes(localSearchQuery.toLowerCase())
                      )
                      .map((rental: any) => (
                        <tr key={rental.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {rental.productName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {rental.serialNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(rental.issuedDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(rental.dueDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <button
                              onClick={() => handleReturnClick(rental.id)}
                              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
                            >
                              Return Item
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        });
      })()}
      {/* Rent Item Button and Modal */}
      <div className="mt-8">
        <button
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
          onClick={() => setShowRentModal(true)}
        >
          Rent Item
        </button>
      </div>
      {showRentModal && student && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Rent Item to {student.studentName}</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Component</label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={rentModalProduct ? rentModalProduct.id : ''}
                onChange={e => {
                  const prod = products.find((p: any) => p.id === e.target.value);
                  setRentModalProduct(prod);
                  setRentModalSerial('');
                }}
              >
                <option value="">Select Component</option>
                {availableProducts.map((product: any) => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
            </div>
            {rentModalProduct && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={rentModalSerial}
                    onChange={e => setRentModalSerial(e.target.value)}
                  >
                    <option value="">Select Serial Number</option>
                    {rentModalProduct.serialNumbers.filter((sn: string) =>
                      !rentModalProduct.rentedSerialNumbers.some((r: any) => r.serialNumber === sn)
                    ).map((sn: string) => (
                      <option key={sn} value={sn}>{sn}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  {/* @ts-ignore */}
                  <DatePicker
                    selected={rentModalDueDate}
                    onChange={(date: Date | null) => setRentModalDueDate(date)}
                    minDate={new Date()}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholderText="Select due date"
                  />
                </div>
              </>
            )}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowRentModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                disabled={renting}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!rentModalProduct || !rentModalSerial || !rentModalDueDate) return;
                  setRenting(true);
                  try {
                    await rentProduct(
                      rentModalProduct.id,
                      student.studentId,
                      rentModalDueDate.toISOString().split('T')[0],
                      rentModalSerial
                    );
                    setShowRentModal(false);
                    setRentModalProduct(null);
                    setRentModalSerial('');
                    setRentModalDueDate(null);
                    setRentSuccess('Component issued successfully!');
                    setTimeout(() => setRentSuccess(null), 3000);
                  } finally {
                    setRenting(false);
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
                disabled={!rentModalProduct || !rentModalSerial || !rentModalDueDate || renting}
              >
                Confirm Rent
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Return Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Return</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to return this item?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowReturnModal(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReturnConfirm(showReturnModal)}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
              >
                Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;