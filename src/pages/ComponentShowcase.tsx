import React, { useState } from 'react';
import {
  ResponsiveLayout,
  PageContainer,
  Button,
  Input,
  Avatar,
  Badge,
  Card,
  CardHeader,
  CardBody,
  Modal,
  Toast,
  SearchBar,
  TabBar,
  CarCard,
  ProfileCard,
  CarGrid,
  ChatList,
  StoreGrid,
  Typography,
  Switch,
  Checkbox,
} from '@/components';
import { useResponsive } from '@/hooks/useMediaQuery';
import { HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

/**
 * ComponentShowcase - Pagină demonstrativă cu toate componentele
 * Exemplu complet de utilizare a component library-ului Cruizr
 */
export default function ComponentShowcase() {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [activeTab, setActiveTab] = useState('atoms');

  const tabs = [
    { id: 'atoms', label: 'Atoms', icon: '⚛️' },
    { id: 'molecules', label: 'Molecules', icon: '🧬' },
    { id: 'organisms', label: 'Organisms', icon: '🦠' },
    { id: 'layouts', label: 'Layouts', icon: '📐' },
  ];

  return (
    <ResponsiveLayout
      showHeader
      showBottomNav
      headerProps={{
        title: 'Component Showcase',
        notificationCount: 3,
      }}
      maxWidth="2xl"
    >
      <PageContainer
        title="Cruizr UI Components"
        subtitle="Component library complet și responsive"
        transition="fade"
      >
        {/* Device Info */}
        <Card variant="gradient" padding="md" className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="h5" color="primary">
                Current Device
              </Typography>
              <Typography variant="body2" className="mt-1">
                {isMobile && '📱 Mobile'}
                {isTablet && '📱 Tablet'}
                {isDesktop && '🖥️ Desktop'}
              </Typography>
            </div>
            <div className="flex gap-2">
              <Badge variant={isMobile ? 'primary' : 'gray'}>Mobile</Badge>
              <Badge variant={isTablet ? 'primary' : 'gray'}>Tablet</Badge>
              <Badge variant={isDesktop ? 'primary' : 'gray'}>Desktop</Badge>
            </div>
          </div>
        </Card>

        {/* Tab Navigation */}
        <TabBar
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="pills"
          className="mb-8"
        />

        {/* ATOMS Section */}
        {activeTab === 'atoms' && (
          <div className="space-y-8">
            {/* Buttons */}
            <Card>
              <CardHeader title="Buttons" subtitle="Diferite variante și dimensiuni" />
              <CardBody>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="danger">Danger</Button>
                    <Button variant="success">Success</Button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button size="xs">Extra Small</Button>
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large</Button>
                    <Button size="xl">Extra Large</Button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button leftIcon={<HeartIcon className="w-5 h-5" />}>
                      With Icon
                    </Button>
                    <Button loading>Loading...</Button>
                    <Button disabled>Disabled</Button>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Inputs */}
            <Card>
              <CardHeader title="Inputs" subtitle="Form inputs cu diferite stiluri" />
              <CardBody>
                <div className="space-y-4">
                  <Input label="Default Input" placeholder="Enter text..." />
                  <Input
                    label="With Icon"
                    placeholder="Search..."
                    leftIcon={<ChatBubbleLeftIcon className="w-5 h-5" />}
                    variant="filled"
                  />
                  <Input
                    label="With Error"
                    placeholder="Invalid input"
                    error="This field is required"
                  />
                </div>
              </CardBody>
            </Card>

            {/* Avatars & Badges */}
            <Card>
              <CardHeader title="Avatars & Badges" />
              <CardBody>
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center gap-4">
                    <Avatar size="xs" fallback="XS" />
                    <Avatar size="sm" fallback="SM" />
                    <Avatar size="md" fallback="MD" status="online" showStatus />
                    <Avatar size="lg" fallback="LG" status="busy" showStatus />
                    <Avatar size="xl" fallback="XL" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="primary">Primary</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="success" dot>Online</Badge>
                    <Badge variant="danger">Urgent</Badge>
                    <Badge variant="warning">VIP</Badge>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Typography */}
            <Card>
              <CardHeader title="Typography" subtitle="Text responsive și scalabil" />
              <CardBody>
                <div className="space-y-3">
                  <Typography variant="h1" color="primary">Heading 1</Typography>
                  <Typography variant="h2">Heading 2</Typography>
                  <Typography variant="h3">Heading 3</Typography>
                  <Typography variant="body1">Body text - Lorem ipsum dolor sit amet</Typography>
                  <Typography variant="body2">Smaller body text</Typography>
                  <Typography variant="caption">Caption text</Typography>
                </div>
              </CardBody>
            </Card>

            {/* Switch & Checkbox */}
            <Card>
              <CardHeader title="Switch & Checkbox" />
              <CardBody>
                <div className="space-y-4">
                  <Switch label="Enable notifications" />
                  <Switch label="Dark mode" size="lg" />
                  <Checkbox label="I agree to terms and conditions" />
                  <Checkbox label="Subscribe to newsletter" />
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* MOLECULES Section */}
        {activeTab === 'molecules' && (
          <div className="space-y-8">
            {/* SearchBar */}
            <Card>
              <CardHeader title="Search Bar" subtitle="Căutare cu debounce" />
              <CardBody>
                <SearchBar
                  placeholder="Search for cars, users..."
                  onSearch={(value) => console.log('Search:', value)}
                />
              </CardBody>
            </Card>

            {/* Modal Trigger */}
            <Card>
              <CardHeader title="Modal" subtitle="Dialog responsive" />
              <CardBody>
                <Button onClick={() => setShowModal(true)}>
                  Open Modal
                </Button>
              </CardBody>
            </Card>

            {/* Toast Trigger */}
            <Card>
              <CardHeader title="Toast Notifications" />
              <CardBody>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="success"
                    onClick={() => setShowToast(true)}
                  >
                    Show Toast
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Car Cards */}
            <Card>
              <CardHeader title="Car Cards" />
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <CarCard
                    image="https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=400"
                    make="BMW"
                    model="M3"
                    year={2023}
                    badges={['Tuned', 'Modified']}
                    isVIP
                  />
                  <CarCard
                    image="https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400"
                    make="Mercedes"
                    model="AMG GT"
                    year={2022}
                    badges={['Performance']}
                  />
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* ORGANISMS Section */}
        {activeTab === 'organisms' && (
          <div className="space-y-8">
            {/* Profile Card */}
            <Card>
              <CardHeader title="Profile Card" subtitle="Card complex pentru utilizatori" />
              <CardBody>
                <ProfileCard
                  profile={{
                    id: '1',
                    name: 'Alexandra',
                    age: 26,
                    avatar: 'https://i.pravatar.cc/300?img=1',
                    photos: [
                      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
                      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
                    ],
                    bio: 'Car enthusiast | BMW lover | Racing on weekends',
                    location: 'București',
                    distance: 5,
                    car: {
                      make: 'BMW',
                      model: 'M4',
                      year: 2023,
                    },
                    interests: ['Racing', 'Tuning', 'Car Meets'],
                    badges: ['First Match', 'Popular'],
                    isVIP: true,
                  }}
                  onLike={(id) => console.log('Liked:', id)}
                  onDislike={(id) => console.log('Disliked:', id)}
                  showActions
                />
              </CardBody>
            </Card>

            {/* Car Grid */}
            <Card>
              <CardHeader title="Car Grid" subtitle="Grid responsive pentru mașini" />
              <CardBody>
                <CarGrid
                  cars={[
                    {
                      id: '1',
                      image: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=400',
                      make: 'BMW',
                      model: 'M3',
                      year: 2023,
                      badges: ['Tuned'],
                      isVIP: true,
                    },
                    {
                      id: '2',
                      image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400',
                      make: 'Mercedes',
                      model: 'AMG GT',
                      year: 2022,
                    },
                    {
                      id: '3',
                      image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f1f8e?w=400',
                      make: 'Audi',
                      model: 'RS6',
                      year: 2024,
                      badges: ['New'],
                    },
                  ]}
                  onCarClick={(id) => console.log('Car clicked:', id)}
                />
              </CardBody>
            </Card>
          </div>
        )}

        {/* LAYOUTS Section */}
        {activeTab === 'layouts' && (
          <div className="space-y-8">
            <Card>
              <CardHeader
                title="Responsive Layouts"
                subtitle="Sistemul de layout-uri se adaptează automat"
              />
              <CardBody>
                <Typography variant="body1" className="mb-4">
                  Layout-ul curent folosește:
                </Typography>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>
                    <strong>ResponsiveLayout</strong> - Container principal
                  </li>
                  <li>
                    <strong>TopHeader</strong> - Header cu logo și notificări
                  </li>
                  <li>
                    <strong>BottomNavigation</strong> - Vizibil pe mobile/tablet
                  </li>
                  <li>
                    <strong>PageContainer</strong> - Wrapper cu tranziții
                  </li>
                </ul>
                
                <div className="mt-6 p-4 bg-pink-50 rounded-lg">
                  <Typography variant="body2" color="primary">
                    💡 Tip: Redimensionează fereastra pentru a vedea adaptarea automată!
                  </Typography>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </PageContainer>

      {/* Modal Example */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Example Modal"
        size="md"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setShowModal(false)}>
              Confirm
            </Button>
          </div>
        }
      >
        <Typography variant="body1">
          Acesta este un modal responsive. Pe mobile apare fullscreen, iar pe desktop
          este centrat.
        </Typography>
      </Modal>

      {/* Toast Example */}
      {showToast && (
        <Toast
          type="success"
          message="Success!"
          description="Component library loaded successfully"
          onClose={() => setShowToast(false)}
          position="top-right"
        />
      )}
    </ResponsiveLayout>
  );
}
