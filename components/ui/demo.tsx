import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/animated-table-rows';

import { FiTrash2 } from 'react-icons/fi';

const productsData = [
  {
    id: 'PROD001',
    name: 'Wireless Mouse',
    category: 'Electronics',
    price: '$29.99',
    stock: 150,
  },
  {
    id: 'PROD002',
    name: 'Mechanical Keyboard',
    category: 'Electronics',
    price: '$89.99',
    stock: 75,
  },
  {
    id: 'PROD003',
    name: 'Noise-Cancelling Headphones',
    category: 'Audio',
    price: '$199.99',
    stock: 45,
  },
  {
    id: 'PROD004',
    name: 'Ergonomic Chair',
    category: 'Furniture',
    price: '$249.99',
    stock: 30,
  },
  {
    id: 'PROD005',
    name: 'Standing Desk',
    category: 'Furniture',
    price: '$399.99',
    stock: 20,
  },
];

export default function TableRowDeleteDemo() {
  const [products, setProducts] = useState(productsData);

  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);

  const handleDelete = (id: string) => {
    setProducts((prev) => prev.filter((product) => product.id !== id));
  };

  return (
    <div className='w-full px-10'>
      <Table>
        <TableCaption>A list of products in inventory.</TableCaption>

        <TableHeader>
          <TableRow>
            <TableHead className='w-[100px]'>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className='text-right'>Price</TableHead>
            <TableHead className='text-right'>Stock</TableHead>
            <TableHead className='w-[60px] text-center'>Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <AnimatePresence>
            {products.map((product, index) => (
              <motion.tr
                key={product.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className='border-b transition-colors hover:bg-muted/50'
              >
                <TableCell className='font-medium'>{product.id}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell className='text-right'>{product.price}</TableCell>
                <TableCell className='text-right'>{product.stock}</TableCell>
                <TableCell className='text-center'>
                  <button
                    aria-label={`Delete ${product.name}`}
                    onClick={() => handleDelete(product.id)}
                    className='p-1 rounded hover:bg-red-100 text-red-600'
                  >
                    <FiTrash2 size={18} />
                  </button>
                </TableCell>
              </motion.tr>
            ))}
          </AnimatePresence>
        </TableBody>

        <TableFooter>
          <TableRow>
            <TableCell colSpan={5}>Total Stock</TableCell>
            <TableCell className='text-right'>{totalStock}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
