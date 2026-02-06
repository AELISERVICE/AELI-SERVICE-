import React from 'react';
import { Pagination } from '../components/global/Pagination';
import { ReviewsList } from '../components/review/ReviewsList';


export function ReviewsScreen() {
    return (
        <div>
            <div >
                <ReviewsList />
            </div>
            <div className="mt-6">
                <Pagination />
            </div>
        </div>

    );
};
