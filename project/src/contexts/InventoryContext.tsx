import React, { createContext, useState, useContext, useEffect } from 'react';

export interface Product {
  id: string;
  name: string;
  description: string;
  mainCategory: string;
  subCategory: string;
  imageUrl: string;
  totalQuantity: number;
  availableQuantity: number;
  serialNumbers: string[];
  rentedSerialNumbers: { 
    serialNumber: string; 
    studentId: string;
    issuedDate: string;
    dueDate: string;
  }[];
}

interface InventoryContextType {
  products: Product[];
  categories: { main: string; sub: string[] }[];
  statistics: {
    totalComponents: number;
    activeRentals: number;
    satisfactionRate: number;
    totalStudents: number;
  };
  isLoading: boolean;
  getProduct: (id: string) => Product | undefined;
  updateProductQuantity: (id: string, newQuantity: number) => void;
  rentProduct: (productId: string, studentId: string, dueDate: string, serialNumber: string) => Promise<string>;
  returnProduct: (productId: string, serialNumber: string) => void;
  getStudentRentals: (studentId: string) => { 
    product: Product; 
    serialNumber: string;
    issuedDate: string;
    dueDate: string;
  }[];
  getProductsByCategory: (mainCategory: string) => Product[];
  getRentalsByCategory: (mainCategory: string) => {
    product: Product;
    rentals: {
      serialNumber: string;
      studentId: string;
      studentName: string;
      issuedDate: string;
      dueDate: string;
    }[];
  }[];
  handleReturnItem: (productId: string, serialNumber: string) => void;
}

// Sample products with updated structure
const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Arduino Uno',
    description: 'Microcontroller board based on the ATmega328P.',
    mainCategory: 'Development Boards',
    subCategory: 'Arduino',
    imageUrl: 'https://images.pexels.com/photos/132700/pexels-photo-132700.jpeg',
    totalQuantity: 20,
    availableQuantity: 15,
    serialNumbers: Array.from({ length: 20 }, (_, i) => `ARD${1000 + i}`),
    rentedSerialNumbers: [
      { serialNumber: 'ARD1000', studentId: '1', issuedDate: '2025-03-01', dueDate: '2025-07-01' },
      { serialNumber: 'ARD1001', studentId: '1', issuedDate: '2025-03-05', dueDate: '2025-07-05' },
    ],
  },
  {
    id: '2',
    name: 'Raspberry Pi 4',
    description: 'Single-board computer with 4GB RAM.',
    mainCategory: 'Development Boards',
    subCategory: 'Raspberry Pi',
    imageUrl: 'https://images.pexels.com/photos/5816294/pexels-photo-5816294.jpeg',
    totalQuantity: 15,
    availableQuantity: 10,
    serialNumbers: Array.from({ length: 15 }, (_, i) => `RPI${2000 + i}`),
    rentedSerialNumbers: [
      { serialNumber: 'RPI2000', studentId: '2', issuedDate: '2025-03-15', dueDate: '2025-07-15' },
      { serialNumber: 'RPI2001', studentId: '1', issuedDate: '2025-03-20', dueDate: '2025-07-20' },
    ],
  },
  // Add more products with main and sub categories
];

const categories = [
  { 
    main: 'Development Boards',
    sub: ['Arduino', 'Raspberry Pi', 'ESP32', 'STM32']
  },
  {
    main: 'Sensors',
    sub: ['Temperature', 'Humidity', 'Motion', 'Distance']
  },
  {
    main: 'Motors & Actuators',
    sub: ['DC Motors', 'Servo Motors', 'Stepper Motors', 'Linear Actuators']
  },
  {
    main: 'Drone Parts',
    sub: ['Flight Controllers', 'ESCs', 'Propellers', 'Frames']
  },
  {
    main: 'Components',
    sub: ['Resistors', 'Capacitors', 'LEDs', 'Transistors']
  }
];

// Sample student data
export const studentData: Record<string, { name: string }> = {
  '1': { name: 'Prathamesh Yewale' },
  '2': { name: 'Utkarsh Yadav' },
  '3': { name: 'Harshad Kalane' },
  '4': { name: 'Om Joshi' },
  '5': { name: 'Atharva Sathe' },
};

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [isLoading, setIsLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    totalComponents: 0,
    activeRentals: 0,
    satisfactionRate: 95,
    totalStudents: 0
  });

  useEffect(() => {
    // Calculate live statistics
    const totalComponents = products.reduce((sum, product) => sum + product.totalQuantity, 0);
    const activeRentals = products.reduce((sum, product) => sum + product.rentedSerialNumbers.length, 0);
    const totalStudents = new Set(
      products.flatMap(product => 
        product.rentedSerialNumbers.map(rental => rental.studentId)
      )
    ).size;

    setStatistics({
      totalComponents,
      activeRentals,
      satisfactionRate: 95, // This would come from a review system in a real app
      totalStudents
    });

    // Set loading to false after initializing data
    setIsLoading(false);
  }, [products]);

  const getProduct = (id: string) => {
    return products.find(p => p.id === id);
  };

  const updateProductQuantity = (id: string, newQuantity: number) => {
    setProducts(prevProducts => 
      prevProducts.map(product => {
        if (product.id === id) {
          // Calculate the difference between new total and current total
          const quantityDiff = newQuantity - product.totalQuantity;
          
          // Update serial numbers array based on quantity change
          let updatedSerialNumbers = [...product.serialNumbers];
          if (quantityDiff > 0) {
            // Add new serial numbers
            const lastNum = parseInt(product.serialNumbers[product.serialNumbers.length - 1].replace(/[^\d]/g, ''));
            for (let i = 1; i <= quantityDiff; i++) {
              const prefix = product.serialNumbers[0].replace(/\d+$/, '');
              updatedSerialNumbers.push(`${prefix}${lastNum + i}`);
            }
          } else if (quantityDiff < 0) {
            // Remove serial numbers that aren't currently rented
            const rentedSerials = new Set(product.rentedSerialNumbers.map(r => r.serialNumber));
            const availableSerials = updatedSerialNumbers.filter(sn => !rentedSerials.has(sn));
            const toRemove = Math.min(Math.abs(quantityDiff), availableSerials.length);
            updatedSerialNumbers = [
              ...updatedSerialNumbers.filter(sn => rentedSerials.has(sn)),
              ...availableSerials.slice(0, availableSerials.length - toRemove)
            ];
          }

          return {
            ...product,
            totalQuantity: newQuantity,
            availableQuantity: newQuantity - product.rentedSerialNumbers.length,
            serialNumbers: updatedSerialNumbers
          };
        }
        return product;
      })
    );
  };

  const rentProduct = async (
    productId: string,
    studentId: string,
    dueDate: string,
    serialNumber: string
  ) => {
    const product = products.find(p => p.id === productId);
    if (!product || product.availableQuantity <= 0) {
      throw new Error('Product not available for rent');
    }

    const availableSerialNumbers = product.serialNumbers.filter(
      sn => !product.rentedSerialNumbers.some(r => r.serialNumber === sn)
    );

    if (availableSerialNumbers.length === 0) {
      throw new Error('No available units to rent');
    }

    const issuedDate = new Date().toISOString().split('T')[0];

    setProducts(prevProducts =>
      prevProducts.map(p => {
        if (p.id === productId) {
          return {
            ...p,
            availableQuantity: p.availableQuantity - 1,
            rentedSerialNumbers: [
              ...p.rentedSerialNumbers,
              { serialNumber, studentId, issuedDate, dueDate }
            ]
          };
        }
        return p;
      })
    );

    return serialNumber;
  };

  const returnProduct = (productId: string, serialNumber: string) => {
    setProducts(prevProducts =>
      prevProducts.map(p => {
        if (p.id === productId) {
          return {
            ...p,
            availableQuantity: p.availableQuantity + 1,
            rentedSerialNumbers: p.rentedSerialNumbers.filter(
              r => r.serialNumber !== serialNumber
            )
          };
        }
        return p;
      })
    );
  };

  const getStudentRentals = (studentId: string) => {
    return products.flatMap(product => 
      product.rentedSerialNumbers
        .filter(rental => rental.studentId === studentId)
        .map(rental => ({
          product,
          serialNumber: rental.serialNumber,
          issuedDate: rental.issuedDate,
          dueDate: rental.dueDate
        }))
    );
  };

  const getProductsByCategory = (mainCategory: string) => {
    return products.filter(p => p.mainCategory === mainCategory);
  };

  const getRentalsByCategory = (mainCategory: string) => {
    return products
      .filter(p => p.mainCategory === mainCategory)
      .map(product => ({
        product,
        rentals: product.rentedSerialNumbers.map(rental => ({
          ...rental,
          studentName: studentData[rental.studentId]?.name || 'Unknown Student'
        }))
      }));
  };

  const handleReturnItem = (productId: string, serialNumber: string) => {
    setProducts(prevProducts => 
      prevProducts.map(product => {
        if (product.id === productId) {
          return {
            ...product,
            rentedSerialNumbers: product.rentedSerialNumbers.filter(
              rental => rental.serialNumber !== serialNumber
            )
          };
        }
        return product;
      })
    );
  };

  return (
    <InventoryContext.Provider
      value={{
        products,
        categories,
        statistics,
        isLoading,
        getProduct,
        updateProductQuantity,
        rentProduct,
        returnProduct,
        getStudentRentals,
        getProductsByCategory,
        getRentalsByCategory,
        handleReturnItem
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};