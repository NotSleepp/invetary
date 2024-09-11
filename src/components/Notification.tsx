'use client'

import React, { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Notification } from '@/types'

export const NotificationIcon: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user?.id)
      .eq('read', false)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notifications:', error)
    } else {
      setNotifications(data || [])
    }
  }

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)

    if (error) {
      console.error('Error marking notification as read:', error)
    } else {
      setNotifications(notifications.filter(n => n.id !== notificationId))
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <Bell className="h-6 w-6" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {notifications.length}
          </span>
        )}
      </button>
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
          <div className="py-2">
            {notifications.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No new notifications</p>
            ) : (
              notifications.map((notification) => (
                <div key={notification.id} className="px-4 py-2 hover:bg-gray-100">
                  <p className="text-sm">{notification.message}</p>
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="text-xs text-blue-500 mt-1 hover:underline"
                  >
                    Mark as read
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}