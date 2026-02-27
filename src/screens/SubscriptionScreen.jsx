import React from 'react';
import { ToastContainer } from 'react-toastify';
import { Subscription } from '../components/Subscription/Subscription';


export function SubscriptionScreen() {
    return (
        <div >
            <Subscription />
            <ToastContainer position="bottom-center" />
        </div>
    )
}
