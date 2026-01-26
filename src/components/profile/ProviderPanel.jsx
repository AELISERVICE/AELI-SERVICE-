import React from 'react'
import { Card } from '../../ui/Card'
import { Badge } from '../../ui/Badge'
import {
  Store,
  Star,
  Calendar,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'
export function ProviderPanel() {
  return (
    <div className="h-full">
      <Card className="h-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 to-pink-500 p-4 text-white">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-white/80" />
            <h3 className="font-semibold">Provider Details</h3>
          </div>
        </div>

        <div className="p-6 flex-1 flex flex-col gap-8">
          {/* Salon Info */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Salon Marie
            </h2>
            <div className="flex items-center justify-center gap-1.5 text-blue-600 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Verified Business</span>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 text-gray-600 font-medium">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              Rating
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">4.8</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-4 h-4 text-amber-400 fill-amber-400"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Subscription */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-gray-400" />
              <h3 className="font-bold text-gray-900">Subscription</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500 text-sm">Status</span>
                <Badge variant="success">Active</Badge>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500 text-sm">Plan</span>
                <span className="font-medium text-gray-900">Monthly</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500 text-sm">Days Remaining</span>
                <span className="font-bold text-red-500">15 days</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 font-medium">
                Subscription expires in 15 days. Renew now to keep your provider
                benefits.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
