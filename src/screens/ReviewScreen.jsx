import React from 'react';
import { ToastContainer } from 'react-toastify';
import { ReviewsList } from '../components/review/ReviewsList';


export function ReviewsScreen() {
    return (
        <div>
            <div >
                <ReviewsList />
            </div>
            <ToastContainer position="bottom-center" />
        </div>

    );
};
