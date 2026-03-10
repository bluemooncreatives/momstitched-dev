'use client';

import { useEffect, useState } from 'react';
import FeaturedProductLarge from './FeaturedProductLarge';
import FeaturedProductSmall from './FeaturedProductSmall';

const FeaturedProduct = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/product/get-featured-product`);
                const data = await response.json();

                if (data.success && data.data) {
                    setProducts(data.data);
                } else {
                    setError('Failed to load products');
                }
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('Error loading products');
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedProducts();
    }, []);

    if (loading) {
        return (
            <section className='py-16 lg:py-10 bg-[#FFECD1]'>
                <div className='max-w mx-auto px-4 lg:px-8'>
                    <div className='grid grid-cols-2 gap-4 lg:gap-6'>
                        {/* Left Column Loading */}
                        <div className='col-span-1'>
                            <div className='bg-gray-300 rounded-sm animate-pulse mb-3' style={{ aspectRatio: '1 / 1.29' }}></div>
                            <div className='grid grid-cols-2 gap-3'>
                                <div className='bg-gray-300 rounded-sm animate-pulse' style={{ aspectRatio: '1 / 1.15' }}></div>
                                <div className='bg-gray-300 rounded-sm animate-pulse' style={{ aspectRatio: '1 / 1.15' }}></div>
                            </div>
                        </div>

                        {/* Right Column Loading */}
                        <div className='col-span-1'>
                            <div className='grid grid-cols-2 gap-3 lg:gap-4'>
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className='bg-gray-300 rounded-sm animate-pulse' style={{ aspectRatio: '1 / 1.15' }}></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (error || !products.length) {
        return (
            <section className='bg-[#FFECD1] py-16 lg:py-10'>
                <div className='max-w mx-auto px-4 lg:px-8'>
                    <div className='text-center py-12 text-gray-600'>
                        {error || 'No featured products available'}
                    </div>
                </div>
            </section>
        );
    }

    // Split products: 1 large + 2 bottom + 6 right grid
    const featuredProduct = products[0];
    const bottomLeftProducts = products.slice(1, 3);
    const rightGridProducts = products.slice(3, 9);

    return (
        <section className='bg-[#FFECD1] py-16 lg:py-10'>
            <div className='max-w mx-auto px-4 lg:px-10'>
                {/* Main Grid: 50% Left | 50% Right */}
                <div className='grid grid-cols-2 gap-4 lg:gap-8'>
                    {/* LEFT COLUMN (50%) */}
                    <div className='col-span-1'>
                        {/* Top: Large Featured Product */}
                        {featuredProduct && (
                            <div className='mb-3 lg:mb-4'>
                                <FeaturedProductLarge product={featuredProduct} />
                            </div>
                        )}

                        {/* Bottom: Two Small Products */}
                        <div className='grid grid-cols-2 gap-3 lg:gap-4'>
                            {bottomLeftProducts.map((product) => (
                                <div key={product._id}>
                                    <FeaturedProductSmall product={product} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT COLUMN (50%) */}
                    <div className='col-span-1'>
                        {/* Grid of 6 products (2 columns x 3 rows) */}
                        <div className='grid grid-cols-2 gap-3 lg:gap-4'>
                            {rightGridProducts.map((product) => (
                                <div key={product._id}>
                                    <FeaturedProductSmall product={product} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturedProduct;