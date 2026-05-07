'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Shield,
  Users,
  BookOpen,
  Palette,
  Save,
  Plus,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react'

interface ContactInfo {
  id: string
  type: 'phone' | 'email' | 'address' | 'consultation' | 'website' | 'social'
  title: string
  value: string
  icon: string
  color: string
  displayOrder: number
  active: boolean
}

interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
}

const ContactManagementPage: React.FC = () => {
  const [contactData, setContactData] = useState<ContactInfo[]>([])
  const [themeColors, setThemeColors] = useState<ThemeColors>({
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    accent: '#10B981',
    background: '#F9FAFB',
    text: '#1F2937'
  })
  const [newItem, setNewItem] = useState<Partial<ContactInfo>>({
    type: 'phone',
    title: '',
    value: '',
    icon: 'Phone',
    color: '#3B82F6',
    displayOrder: 0,
    active: true
  })
  const [activeTab, setActiveTab] = useState('contact')
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    // Load contact data from localStorage or API
    const savedData = localStorage.getItem('contactData')
    if (savedData) {
      setContactData(JSON.parse(savedData))
    } else {
      // Default data
      setContactData([
        {
          id: '1',
          type: 'phone',
          title: 'Phone',
          value: '+254 770 140 889',
          icon: 'Phone',
          color: '#10B981',
          displayOrder: 1,
          active: true
        },
        {
          id: '2',
          type: 'phone',
          title: 'Alternative Phone',
          value: '+254 716 842 028',
          icon: 'Phone',
          color: '#3B82F6',
          displayOrder: 2,
          active: true
        },
        {
          id: '3',
          type: 'email',
          title: 'Email',
          value: 'hello@stephenasatsa.com',
          icon: 'Mail',
          color: '#8B5CF6',
          displayOrder: 3,
          active: true
        },
        {
          id: '4',
          type: 'address',
          title: 'Address',
          value: 'P.O Box 954 00502, Karen – Nairobi',
          icon: 'MapPin',
          color: '#F59E0B',
          displayOrder: 4,
          active: true
        },
        {
          id: '5',
          type: 'consultation',
          title: 'Book a Consultation',
          value: 'https://calendly.com/stephen-asatsa',
          icon: 'Calendar',
          color: '#EF4444',
          displayOrder: 5,
          active: true
        }
      ])
    }

    // Load theme colors
    const savedTheme = localStorage.getItem('contactTheme')
    if (savedTheme) {
      setThemeColors(JSON.parse(savedTheme))
    }
  }, [])

  const saveContactData = () => {
    localStorage.setItem('contactData', JSON.stringify(contactData))
    // Here you would also save to your backend API
    console.log('Contact data saved:', contactData)
  }

  const saveThemeColors = () => {
    localStorage.setItem('contactTheme', JSON.stringify(themeColors))
    console.log('Theme colors saved:', themeColors)
  }

  const addContactItem = () => {
    if (newItem.title && newItem.value) {
      const item: ContactInfo = {
        id: Date.now().toString(),
        type: newItem.type || 'phone',
        title: newItem.title,
        value: newItem.value,
        icon: newItem.icon || 'Phone',
        color: newItem.color || '#3B82F6',
        displayOrder: contactData.length + 1,
        active: true
      }
      setContactData([...contactData, item])
      setNewItem({
        type: 'phone',
        title: '',
        value: '',
        icon: 'Phone',
        color: '#3B82F6',
        displayOrder: 0,
        active: true
      })
    }
  }

  const updateContactItem = (id: string, field: keyof ContactInfo, value: any) => {
    setContactData(prev => 
      prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  const deleteContactItem = (id: string) => {
    setContactData(prev => prev.filter(item => item.id !== id))
  }

  const toggleContactActive = (id: string) => {
    setContactData(prev => 
      prev.map(item => 
        item.id === id ? { ...item, active: !item.active } : item
      )
    )
  }

  const updateThemeColor = (colorKey: keyof ThemeColors, value: string) => {
    setThemeColors(prev => ({
      ...prev,
      [colorKey]: value
    }))
  }

  const getIconOptions = () => [
    { value: 'Phone', label: 'Phone' },
    { value: 'Mail', label: 'Email' },
    { value: 'MapPin', label: 'Address' },
    { value: 'Calendar', label: 'Calendar' },
    { value: 'Shield', label: 'Security' },
    { value: 'Users', label: 'People' },
    { value: 'BookOpen', label: 'Document' }
  ]

  const getTypeOptions = () => [
    { value: 'phone', label: 'Phone' },
    { value: 'email', label: 'Email' },
    { value: 'address', label: 'Address' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'website', label: 'Website' },
    { value: 'social', label: 'Social Media' }
  ]

  const sortedContactData = [...contactData].sort((a, b) => a.displayOrder - b.displayOrder)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Contact Management</h1>
        <div className="flex gap-2">
          <Button
            variant={previewMode ? "default" : "outline"}
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {previewMode ? 'Edit Mode' : 'Preview Mode'}
          </Button>
          <Button onClick={() => { saveContactData(); saveThemeColors() }}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="contact">Contact Information</TabsTrigger>
          <TabsTrigger value="theme">Theme Settings</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="contact" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Contact Item</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={newItem.type} onValueChange={(value) => setNewItem(prev => ({ ...prev, type: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getTypeOptions().map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newItem.title}
                  onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Phone, Email, Address"
                />
              </div>
              
              <div>
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  value={newItem.value}
                  onChange={(e) => setNewItem(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="e.g., +254 770 140 889"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <Label htmlFor="icon">Icon</Label>
                <Select value={newItem.icon} onValueChange={(value) => setNewItem(prev => ({ ...prev, icon: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getIconOptions().map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  type="color"
                  value={newItem.color}
                  onChange={(e) => setNewItem(prev => ({ ...prev, color: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  value={newItem.displayOrder}
                  onChange={(e) => setNewItem(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                  placeholder="1, 2, 3..."
                />
              </div>
            </div>
            
            <Button onClick={addContactItem} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Contact Item
            </Button>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Existing Contact Items</h2>
            <div className="space-y-4">
              {sortedContactData.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={item.active}
                        onChange={() => toggleContactActive(item.id)}
                        className="rounded"
                      />
                      <span className={`font-medium ${!item.active ? 'text-gray-400' : ''}`}>
                        {item.title}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteContactItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={item.title}
                        onChange={(e) => updateContactItem(item.id, 'title', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label>Value</Label>
                      <Input
                        value={item.value}
                        onChange={(e) => updateContactItem(item.id, 'value', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label>Type</Label>
                      <Select value={item.type} onValueChange={(value) => updateContactItem(item.id, 'type', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getTypeOptions().map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Color</Label>
                      <Input
                        type="color"
                        value={item.color}
                        onChange={(e) => updateContactItem(item.id, 'color', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="theme" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Theme Customization</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(themeColors).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id={key}
                      type="color"
                      value={value}
                      onChange={(e) => updateThemeColor(key as keyof ThemeColors, e.target.value)}
                      className="w-20"
                    />
                    <Input
                      value={value}
                      onChange={(e) => updateThemeColor(key as keyof ThemeColors, e.target.value)}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 border rounded-lg" style={{ backgroundColor: themeColors.background }}>
              <h3 className="font-semibold mb-2" style={{ color: themeColors.text }}>
                Theme Preview
              </h3>
              <div className="space-y-2">
                <div 
                  className="p-3 rounded"
                  style={{ backgroundColor: themeColors.primary, color: 'white' }}
                >
                  Primary Color
                </div>
                <div 
                  className="p-3 rounded"
                  style={{ backgroundColor: themeColors.secondary, color: 'white' }}
                >
                  Secondary Color
                </div>
                <div 
                  className="p-3 rounded border"
                  style={{ 
                    backgroundColor: themeColors.background, 
                    color: themeColors.text,
                    borderColor: themeColors.accent 
                  }}
                >
                  Background & Text
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
            <div className="border rounded-lg p-4" style={{ backgroundColor: themeColors.background }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedContactData.filter(item => item.active).map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-lg border transition-all hover:scale-105"
                    style={{
                      borderColor: themeColors.primary,
                      backgroundColor: 'white'
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div 
                        className="w-8 h-8 rounded flex items-center justify-center"
                        style={{ backgroundColor: `${item.color}20` }}
                      >
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: item.color }}
                        />
                      </div>
                      <h3 className="font-semibold" style={{ color: themeColors.text }}>
                        {item.title}
                      </h3>
                    </div>
                    <p style={{ color: themeColors.text }}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ContactManagementPage
