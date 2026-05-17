import { Link } from 'expo-router';
import { Text, TouchableOpacity } from 'react-native';

import { AppScreen, SectionCard, SectionTitle } from '@/src/components/ui';

export default function NotFoundScreen() {
  return (
    <AppScreen>
      <SectionCard>
        <SectionTitle title="Not found" subtitle="This prototype screen has not been wired yet." />
        <Link href="/" asChild>
          <TouchableOpacity>
            <Text style={{ color: '#fff', fontWeight: '800' }}>Go back home</Text>
          </TouchableOpacity>
        </Link>
      </SectionCard>
    </AppScreen>
  );
}
