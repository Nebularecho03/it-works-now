'use client'

import React, { useState, useEffect } from 'react'
import { 
  Phone, 
  Mail, 
  MapPin, 
  BookOpen, 
  Users, 
  Shield,
  Calendar,
  MessageCircle,
  ChevronRight,
  Sparkles,
  Palette
} from 'lucide-react'

interface ContactInfo {
  id: string
  type: 'phone' | 'email' | 'address' | 'consultation' | 'trust'
  title: string
  value: string
  icon: React.ElementType
  color: string
  editable?: boolean
}

interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
}

const DynamicContactSection: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [themeColors, setThemeColors] = useState<ThemeColors>({
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    accent: '#10B981',
    background: '#F9FAFB',
    text: '#1F2937'
  })
  
  const [contactData, setContactData] = useState<ContactInfo[]>([
    {
      id: '1',
      type: 'phone',
      title: 'Phone',
      value: '+254 770 140 889',
      icon: Phone,
      color: '#10B981',
      editable: true
    },
    {
      id: '2',
      type: 'phone',
      title: 'Alternative Phone',
      value: '+254 716 842 028',
      icon: Phone,
      color: '#3B82F6',
      editable: true
    },
    {
      id: '3',
      type: 'email',
      title: 'Email',
      value: 'hello@stephenasatsa.com',
      icon: Mail,
      color: '#8B5CF6',
      editable: true
    },
    {
      id: '4',
      type: 'address',
      title: 'Address',
      value: 'P.O Box 954 00502, Karen – Nairobi',
      icon: MapPin,
      color: '#F59E0B',
      editable: true
    },
    {
      id: '5',
      type: 'consultation',
      title: 'Book a Consultation',
      value: 'Schedule Appointment',
      icon: Calendar,
      color: '#EF4444',
      editable: false
    }
  ])

  const [trustSignals] = useState([
    {
      icon: Shield,
      title: 'Licensed by Kenya Counselors and Psychologists Board',
      description: 'Certified professional practice'
    },
    {
      icon: Users,
      title: 'Head of Department of Psychology, CUEA',
      description: 'Academic leadership position'
    },
    {
      icon: BookOpen,
      title: 'Co-founder, BeautifulMind Consultants',
      description: 'Professional consulting practice'
    }
  ])

  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('contact')

  const themePresets = [
    {
      name: 'Professional Blue',
      colors: {
        primary: '#3B82F6',
        secondary: '#1E40AF',
        accent: '#10B981',
        background: '#F9FAFB',
        text: '#1F2937'
      }
    },
    {
      name: 'Warm Purple',
      colors: {
        primary: '#8B5CF6',
        secondary: '#7C3AED',
        accent: '#EC4899',
        background: '#FEF3FF',
        text: '#1F2937'
      }
    },
    {
      name: 'Fresh Green',
      colors: {
        primary: '#10B981',
        secondary: '#059669',
        accent: '#3B82F6',
        background: '#F0FDF4',
        text: '#1F2937'
      }
    },
    {
      name: 'Modern Dark',
      colors: {
        primary: '#1F2937',
        secondary: '#374151',
        accent: '#3B82F6',
        background: '#111827',
        text: '#F9FAFB'
      }
    }
  ]

  const handleColorChange = (colorKey: keyof ThemeColors, value: string) => {
    setThemeColors(prev => ({
      ...prev,
      [colorKey]: value
    }))
  }

  const handleContactDataChange = (id: string, field: 'title' | 'value', newValue: string) => {
    setContactData(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, [field]: newValue }
          : item
      )
    )
  }

  const handleThemePreset = (preset: typeof themePresets[0]) => {
    setThemeColors(preset.colors)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Show feedback
  }

  const getContactIcon = (type: string) => {
    switch (type) {
      case 'phone': return Phone
      case 'email': return Mail
      case 'address': return MapPin
      case 'consultation': return Calendar
      default: return MessageCircle
    }
  }

  return (
    <div 
      className="min-h-screen transition-all duration-500"
      style={{ backgroundColor: themeColors.background }}
    >
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`
          }}
        />
        <div className="relative z-10 px-6 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 inline-flex items-center gap-2">
              <Sparkles 
                className="w-8 h-8"
                style={{ color: themeColors.accent }}
              />
              <h1 
                className="text-4xl font-bold mb-4"
                style={{ color: themeColors.text }}
              >
                Connect With Dr. Stephen Asatsa
              </h1>
            </div>
            <p 
              className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed"
              style={{ color: themeColors.text }}
            >
              Professional psychological services, research leadership, and mentorship rooted in rigor, 
              compassion, and cultural relevance.
            </p>
            
            {/* Theme Customization */}
            {isEditing && (
              <div className="mb-8 p-4 rounded-lg border border-gray-200 bg-white">
                <div className="flex items-center gap-2 mb-4">
                  <Palette className="w-5 h-5" />
                  <h3 className="font-semibold">Customize Theme</h3>
                </div>
                
                {/* Theme Presets */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                  {themePresets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => handleThemePreset(preset)}
                      className="p-2 text-xs rounded border border-gray-200 hover:border-blue-500 transition-colors"
                      style={{ 
                        borderColor: themeColors.primary,
                        backgroundColor: preset.colors.background 
                      }}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
                
                {/* Custom Color Picker */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(themeColors).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <label className="text-xs text-gray-600 mb-1 block">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </label>
                      <input
                        type="color"
                        value={value}
                        onChange={(e) => handleColorChange(key as keyof ThemeColors, e.target.value)}
                        className="w-full h-8 rounded cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Edit Toggle */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-105"
              style={{ 
                backgroundColor: themeColors.primary,
                color: 'white'
              }}
            >
              {isEditing ? 'Save Changes' : 'Customize Design'}
              {isEditing ? <Shield className="w-4 h-4" /> : <Palette className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          {['contact', 'trust'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium transition-all border-b-2 ${
                activeTab === tab 
                  ? 'font-bold' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              style={{
                borderBottomColor: activeTab === tab ? themeColors.primary : 'transparent',
                color: activeTab === tab ? themeColors.primary : themeColors.text
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'contact' && <MessageCircle className="w-4 h-4 ml-2 inline" />}
              {tab === 'trust' && <Shield className="w-4 h-4 ml-2 inline" />}
            </button>
          ))}
        </div>

        {/* Contact Information Tab */}
        {activeTab === 'contact' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contactData.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.id}
                  className={`p-6 rounded-xl border transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer ${
                    hoveredItem === item.id ? 'ring-2' : ''
                  }`}
                  style={{
                    borderColor: themeColors.primary,
                    backgroundColor: 'white',
                    boxShadow: hoveredItem === item.id ? `0 0 0 2px ${themeColors.accent}` : 'none'
                  }}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => item.type !== 'consultation' && copyToClipboard(item.value)}
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: `${item.color}20` }}
                    >
                      <Icon 
                        className="w-6 h-6"
                        style={{ color: item.color }}
                      />
                    </div>
                    <div className="flex-1">
                      {isEditing && item.editable ? (
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleContactDataChange(item.id, 'title', e.target.value)}
                          className="font-semibold text-gray-900 mb-1 w-full border-b border-gray-300 focus:border-blue-500 outline-none"
                          style={{ color: themeColors.text }}
                        />
                      ) : (
                        <h3 
                          className="font-semibold mb-1"
                          style={{ color: themeColors.text }}
                        >
                          {item.title}
                        </h3>
                      )}
                      
                      {isEditing && item.editable ? (
                        <input
                          type="text"
                          value={item.value}
                          onChange={(e) => handleContactDataChange(item.id, 'value', e.target.value)}
                          className="text-gray-600 w-full border-b border-gray-300 focus:border-blue-500 outline-none"
                          style={{ color: themeColors.text }}
                        />
                      ) : (
                        <p 
                          className="text-gray-600"
                          style={{ color: themeColors.text }}
                        >
                          {item.value}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {item.type === 'consultation' && (
                    <button
                      className="mt-4 w-full py-2 rounded-lg font-medium transition-all hover:scale-105 flex items-center justify-center gap-2"
                      style={{ 
                        backgroundColor: item.color,
                        color: 'white'
                      }}
                    >
                      {item.value}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Trust Signals Tab */}
        {activeTab === 'trust' && (
          <div className="grid md:grid-cols-3 gap-6">
            {trustSignals.map((signal, index) => {
              const Icon = signal.icon
              return (
                <div
                  key={index}
                  className="p-6 rounded-xl border transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  style={{
                    borderColor: themeColors.primary,
                    backgroundColor: 'white'
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: `${themeColors.primary}20` }}
                    >
                      <Icon 
                        className="w-6 h-6"
                        style={{ color: themeColors.primary }}
                      />
                    </div>
                    <div>
                      <h3 
                        className="font-semibold mb-2"
                        style={{ color: themeColors.text }}
                      >
                        {signal.title}
                      </h3>
                      <p 
                        className="text-sm text-gray-600"
                        style={{ color: themeColors.text }}
                      >
                        {signal.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div 
        className="mt-16 text-center p-8"
        style={{
          background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`
        }}
      >
        <h2 className="text-2xl font-bold text-white mb-4">
          Ready to Start Your Journey?
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Take the first step towards positive change and professional growth. 
          Schedule your consultation today.
        </p>
        <button className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:scale-105 transition-all">
          Book Consultation
        </button>
      </div>
    </div>
  )
}

export default DynamicContactSection
