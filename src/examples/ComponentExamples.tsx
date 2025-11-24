/**
 * Exemple de utilizare a componentelor Cruizr UI
 * Ghid rapid pentru implementare
 */

import {
  ResponsiveLayout,
  PageContainer,
  Button,
  Card,
  ProfileCard,
  CarGrid,
  Input,
  useResponsive,
} from '@/components';

// ==================== EXAMPLE 1: Basic Page Layout ====================
export function BasicPageExample() {
  return (
    <ResponsiveLayout
      showHeader
      showBottomNav
      headerProps={{
        notificationCount: 5,
      }}
    >
      <PageContainer
        title="My Page"
        subtitle="Page description"
        action={<Button>Action</Button>}
      >
        <Card>
          <p>Content here</p>
        </Card>
      </PageContainer>
    </ResponsiveLayout>
  );
}

// ==================== EXAMPLE 2: Profile View ====================
export function ProfileExample() {
  const profile = {
    id: '1',
    name: 'John Doe',
    age: 28,
    avatar: '/avatar.jpg',
    photos: ['/photo1.jpg', '/photo2.jpg'],
    bio: 'Car enthusiast',
    car: {
      make: 'BMW',
      model: 'M3',
      year: 2023,
    },
    interests: ['Racing', 'Tuning'],
    isVIP: true,
  };

  return (
    <ResponsiveLayout>
      <PageContainer title="Profile">
        <ProfileCard
          profile={profile}
          onLike={(id: string) => console.log('Liked:', id)}
          onDislike={(id: string) => console.log('Passed:', id)}
          onMessage={(id: string) => console.log('Message:', id)}
          showActions
        />
      </PageContainer>
    </ResponsiveLayout>
  );
}

// ==================== EXAMPLE 3: Car Gallery ====================
export function CarGalleryExample() {
  const cars = [
    {
      id: '1',
      image: '/car1.jpg',
      make: 'BMW',
      model: 'M3',
      year: 2023,
      badges: ['Tuned', 'Modified'],
      isVIP: true,
    },
    // ... more cars
  ];

  return (
    <ResponsiveLayout>
      <PageContainer
        title="Car Gallery"
        subtitle={`${cars.length} cars`}
      >
        <CarGrid
          cars={cars}
          onCarClick={(id: string) => console.log('Car:', id)}
        />
      </PageContainer>
    </ResponsiveLayout>
  );
}

// ==================== EXAMPLE 4: Store ====================
// Note: StoreGrid component is not yet implemented
// export function StoreExample() {
//   const items = [
//     {
//       id: '1',
//       name: 'VIP Badge',
//       description: 'Stand out with VIP status',
//       price: 999,
//       currency: 'coins' as const,
//       category: 'Premium',
//       discount: 20,
//       popular: true,
//       icon: '👑',
//     },
//     // ... more items
//   ];

//   return (
//     <ResponsiveLayout>
//       <PageContainer
//         title="Store"
//         subtitle="Buy power-ups and features"
//       >
//         <Card>
//           <p>Store Grid component will be implemented soon</p>
//         </Card>
//       </PageContainer>
//     </ResponsiveLayout>
//   );
// }

// ==================== EXAMPLE 5: Responsive Hook Usage ====================
export function ResponsiveExample() {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  return (
    <div>
      {isMobile && <MobileView />}
      {isTablet && <TabletView />}
      {isDesktop && <DesktopView />}
    </div>
  );
}

function MobileView() {
  return <div>Mobile optimized view</div>;
}

function TabletView() {
  return <div>Tablet optimized view</div>;
}

function DesktopView() {
  return <div>Desktop view</div>;
}

// ==================== EXAMPLE 6: Form Example ====================
export function FormExample() {
  return (
    <ResponsiveLayout>
      <PageContainer title="Edit Profile">
        <Card padding="lg">
          <form className="space-y-4">
            <Input
              label="Name"
              placeholder="Your name"
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="your@email.com"
              required
            />
            <Input
              label="Bio"
              placeholder="Tell us about yourself..."
            />
            <div className="flex gap-3">
              <Button type="submit" variant="primary" fullWidth>
                Save Changes
              </Button>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </PageContainer>
    </ResponsiveLayout>
  );
}
