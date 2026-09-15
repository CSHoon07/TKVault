import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';

const COLORS = {
  navy: '#0b1938',
  ink: '#19233d',
  muted: '#7d89a1',
  line: '#e7ebf2',
  background: '#f6f8fc',
  gold: '#f6c645',
  white: '#ffffff',
};

const GROUPS = [
  ['Buhangin', '#69b9dc'], ['Bunawan', '#a995d2'], ['Calinan', '#4169d8'],
  ['Indangan', '#ed944c'], ['JP Laurel', '#8060b8'], ['Mandug', '#3ca878'],
  ['Marilog', '#eab18c'], ['Mintal', '#936f58'], ['Panacan', '#1c376d'],
  ['Ponciano', '#72cbb2'], ['Samal', '#4eabc1'], ['Sandawa', '#dd8cae'],
  ['Toril', '#c55391'],
].map(([name, color]) => ({ name, color }));

const POSITIONS = ['Provincial', 'City', 'Locale', 'K&T'];
const COLLECTION_TYPES = ['Event Collection', 'Locale Collection', 'Weekly Dues Collection'];
const TODAY = new Date().toISOString().slice(0, 10);

const SEED_MEMBERS = [
  { id: 1, name: 'Maya Santos', position: 'Provincial', photo: 'MS', color: '#ef806f' },
  { id: 2, name: 'Rafael Cruz', position: 'City', photo: 'RC', color: '#5275f5' },
  { id: 3, name: 'Jasmine Lee', position: 'Locale', photo: 'JL', color: '#e0b535' },
  { id: 4, name: 'Andre Villanueva', position: 'K&T', photo: 'AV', color: '#253b69' },
];

const SEED_COLLECTIONS = [
  { id: 1, memberId: 1, name: 'Maya Santos', position: 'Provincial', amount: 12500, type: 'Event Collection', date: TODAY, photo: 'MS', color: '#ef806f' },
  { id: 2, memberId: 2, name: 'Rafael Cruz', position: 'City', amount: 8400, type: 'Locale Collection', date: '2024-09-18', photo: 'RC', color: '#5275f5' },
  { id: 3, memberId: 3, name: 'Jasmine Lee', position: 'Locale', amount: 2500, type: 'Weekly Dues Collection', date: '2024-09-17', photo: 'JL', color: '#e0b535' },
  { id: 4, memberId: 4, name: 'Andre Villanueva', position: 'K&T', amount: 6800, type: 'Event Collection', date: '2024-09-16', photo: 'AV', color: '#253b69' },
];

const accounts = [
  { username: 'admin@tkvault.com', password: 'password', role: 'administrator', name: 'Maya Santos' },
  ...GROUPS.map(({ name }) => ({
    username: `${name.toLowerCase().replace(/\s/g, '')}@tkvault.com`,
    password: `${name.toLowerCase().replace(/\s/g, '')}123`,
    role: 'group',
    group: name,
    name: `${name} Treasurer`,
  })),
];

const money = (value) =>
  `₱${Number(value || 0).toLocaleString('en-PH', { maximumFractionDigits: 0 })}`;

const initials = (name) =>
  name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

function Logo() {
  return (
    <View style={styles.logo}>
      <Text style={styles.logoMark}>TK</Text>
      <Text style={styles.logoText}>TKVault</Text>
    </View>
  );
}

function Avatar({ member, size = 44 }) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: member.color || '#5275f5' }]}>
      <Text style={styles.avatarText}>{member.photo || initials(member.name || '')}</Text>
    </View>
  );
}

function Field({ label, value, onChangeText, placeholder, keyboardType = 'default', secureTextEntry = false }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#a5afc0"
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
      />
    </View>
  );
}

function PrimaryButton({ title, onPress, secondary = false }) {
  return (
    <Pressable style={[styles.primaryButton, secondary && styles.secondaryButton]} onPress={onPress}>
      <Text style={[styles.primaryButtonText, secondary && styles.secondaryButtonText]}>{title}</Text>
    </Pressable>
  );
}

function LoginScreen({ onLogin, onSignup }) {
  const [username, setUsername] = useState('admin@tkvault.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');

  const submit = () => {
    const account = accounts.find(
      (item) => item.username === username.trim().toLowerCase() && item.password === password,
    );
    if (!account) {
      setError('Incorrect username or password.');
      return;
    }
    onLogin(account);
  };

  return (
    <SafeAreaView style={styles.authPage}>
      <ScrollView contentContainerStyle={styles.authContent} keyboardShouldPersistTaps="handled">
        <View style={styles.authHero}>
          <Logo />
          <Text style={styles.heroEyebrow}>COLLECT WITH CONFIDENCE</Text>
          <Text style={styles.heroTitle}>Every contribution, <Text style={styles.goldText}>beautifully</Text> accounted for.</Text>
          <Text style={styles.heroCopy}>A clear, simple home for your group's collections and reports.</Text>
        </View>
        <View style={styles.authCard}>
          <Text style={styles.eyebrow}>WELCOME BACK</Text>
          <Text style={styles.screenTitle}>Sign in to your vault</Text>
          <Text style={styles.muted}>Manage your collections with clarity.</Text>
          <View style={styles.formSpace}>
            <Field label="Username or email" value={username} onChangeText={setUsername} placeholder="you@example.com" />
            <Field label="Password" value={password} onChangeText={setPassword} placeholder="Enter your password" secureTextEntry />
            {!!error && <Text style={styles.error}>{error}</Text>}
            <PrimaryButton title="Login  →" onPress={submit} />
          </View>
          <View style={styles.demoHint}>
            <Text style={styles.demoText}>Admin: admin@tkvault.com / password</Text>
            <Text style={styles.demoText}>Group example: buhangin@tkvault.com / buhangin123</Text>
          </View>
          <Pressable onPress={onSignup} style={styles.linkButton}>
            <Text style={styles.muted}>New to TKVault? </Text><Text style={styles.link}>Create an account</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SignupScreen({ onBack }) {
  const [name, setName] = useState('');
  return (
    <SafeAreaView style={styles.authPage}>
      <ScrollView contentContainerStyle={styles.authContent} keyboardShouldPersistTaps="handled">
        <View style={styles.authHero}><Logo /><Text style={styles.heroEyebrow}>A BETTER WAY TO KEEP UP</Text><Text style={styles.heroTitle}>Make every peso <Text style={styles.goldText}>count.</Text></Text></View>
        <View style={styles.authCard}>
          <Text style={styles.eyebrow}>GET STARTED</Text>
          <Text style={styles.screenTitle}>Create your account</Text>
          <Text style={styles.muted}>Set up your profile to start using TKVault.</Text>
          <View style={styles.formSpace}><Field label="Full name" value={name} onChangeText={setName} placeholder="e.g. Maya Santos" /><PrimaryButton title="Enter TKVault  →" onPress={onBack} /></View>
          <Pressable onPress={onBack} style={styles.linkButton}><Text style={styles.muted}>Already have an account? </Text><Text style={styles.link}>Sign in</Text></Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function GroupPicker({ account, onSelect, onLogout }) {
  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.groupPicker}>
        <View style={styles.rowBetween}><Logo /><Pressable onPress={onLogout}><Text style={styles.link}>Sign out</Text></Pressable></View>
        <View style={styles.centerIntro}>
          <Text style={styles.eyebrow}>ADMINISTRATOR ACCESS</Text>
          <Text style={styles.screenTitle}>Which group are you managing?</Text>
          <Text style={styles.muted}>Select a group to open its private TKVault workspace.</Text>
        </View>
        <View style={styles.groupGrid}>
          {GROUPS.map((group) => (
            <Pressable key={group.name} onPress={() => onSelect(group.name)} style={[styles.groupButton, { backgroundColor: group.color }]}>
              <View style={styles.groupDot} /><Text style={styles.groupButtonText}>{group.name}</Text><Text style={styles.groupArrow}>↗</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.footerNote}>Signed in as {account.name}. Each group has separate data.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ group, account, onLogout }) {
  const theme = GROUPS.find((item) => item.name === group);
  return (
    <View style={styles.header}>
      <View><Text style={[styles.eyebrow, { color: theme?.color || COLORS.muted }]}>{group.toUpperCase()}</Text><Text style={styles.headerTitle}>TKVault workspace</Text></View>
      <Pressable onPress={onLogout} style={styles.headerAvatar}><Text style={styles.headerAvatarText}>{initials(account.name)}</Text></Pressable>
    </View>
  );
}

function Navigation({ active, setActive }) {
  const items = [
    ['Dashboard', '⌂'], ["Member's Profile", '♙'], ['Collections', '▣'], ['Liquidation Report', '▤'],
  ];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navBar}>
      {items.map(([label, icon]) => (
        <Pressable key={label} onPress={() => setActive(label)} style={[styles.navItem, active === label && styles.navItemActive]}>
          <Text style={[styles.navIcon, active === label && styles.navTextActive]}>{icon}</Text>
          <Text style={[styles.navText, active === label && styles.navTextActive]}>{label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function Dashboard({ collections, group, onAddCollection, onViewCollections }) {
  const totals = useMemo(() => collections.reduce((acc, item) => {
    acc.overall += Number(item.amount) || 0;
    if (item.type === 'Event Collection') acc.event += Number(item.amount) || 0;
    if (item.type === 'Locale Collection') acc.locale += Number(item.amount) || 0;
    if (item.type === 'Weekly Dues Collection') acc.dues += Number(item.amount) || 0;
    return acc;
  }, { overall: 0, event: 0, locale: 0, dues: 0 }), [collections]);
  const theme = GROUPS.find((item) => item.name === group)?.color || '#4169d8';
  const cards = [['Overall collections', totals.overall, '↗'], ['Event collections', totals.event, '✦'], ['Locale collections', totals.locale, '▥'], ['Weekly dues', totals.dues, '◷']];
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.pageHeading}><View><Text style={styles.eyebrow}>OVERVIEW · {group.toUpperCase()}</Text><Text style={styles.pageTitle}>Collection dashboard</Text><Text style={styles.muted}>Here's what's happening with your collections.</Text></View><PrimaryButton title="+ Collection" onPress={onAddCollection} /></View>
      <View style={styles.statGrid}>
        {cards.map(([title, amount, icon], index) => <View key={title} style={[styles.statCard, index === 0 && { backgroundColor: COLORS.navy }, index !== 0 && { borderTopColor: theme }]}><Text style={[styles.statIcon, index === 0 && { color: COLORS.gold }]}>{icon}</Text><Text style={[styles.statTitle, index === 0 && styles.whiteText]}>{title}</Text><Text style={[styles.statAmount, index === 0 && styles.whiteText]}>{money(amount)}</Text><Text style={[styles.statCaption, index === 0 && { color: '#aab7d1' }]}>recorded in this group</Text></View>)}
      </View>
      <View style={styles.panel}><View style={styles.rowBetween}><View><Text style={styles.panelTitle}>Recent collections</Text><Text style={styles.muted}>Latest recorded contributions</Text></View><Pressable onPress={onViewCollections}><Text style={styles.link}>View all →</Text></Pressable></View>{collections.length === 0 ? <Text style={styles.emptyText}>No collections recorded yet.</Text> : collections.slice(0, 5).map((item) => <CollectionRow key={item.id} collection={item} />)}</View>
      <View style={[styles.tipCard, { borderLeftColor: theme }]}><Text style={styles.tipTitle}>Monthly goal</Text><Text style={styles.tipAmount}>{money(Math.min(totals.overall, 100000))} <Text style={styles.muted}>of ₱100,000</Text></Text><View style={styles.progressTrack}><View style={[styles.progressBar, { width: `${Math.min((totals.overall / 100000) * 100, 100)}%`, backgroundColor: theme }]} /></View></View>
    </ScrollView>
  );
}

function CollectionRow({ collection }) {
  return (
    <View style={styles.collectionRow}><Avatar member={collection} size={38} /><View style={styles.collectionPerson}><Text style={styles.bold}>{collection.name}</Text><Text style={styles.smallMuted}>{collection.position} · {collection.type}</Text></View><View><Text style={styles.rowAmount}>{money(collection.amount)}</Text><Text style={styles.smallMuted}>{collection.date}</Text></View></View>
  );
}

function MembersPage({ members, collections, onAdd, onEdit, onDelete }) {
  const [query, setQuery] = useState('');
  const filtered = members.filter((member) => `${member.name} ${member.position}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.pageHeading}><View><Text style={styles.eyebrow}>MEMBER DIRECTORY</Text><Text style={styles.pageTitle}>Member's Profile</Text><Text style={styles.muted}>Manage members and their contributions.</Text></View><PrimaryButton title="+ Member" onPress={onAdd} /></View>
      <TextInput style={styles.searchInput} value={query} onChangeText={setQuery} placeholder="Search members" placeholderTextColor="#a5afc0" />
      {filtered.map((member) => {
        const total = collections.filter((item) => item.memberId === member.id).reduce((sum, item) => sum + Number(item.amount || 0), 0);
        return <View key={member.id} style={styles.memberCard}><View style={styles.rowBetween}><View style={styles.memberIdentity}><Avatar member={member} /><View><Text style={styles.cardTitle}>{member.name}</Text><Text style={styles.muted}>{member.position}</Text></View></View><View style={styles.actionRow}><Pressable onPress={() => onEdit(member)}><Text style={styles.link}>Edit</Text></Pressable><Pressable onPress={() => onDelete(member)}><Text style={styles.dangerText}>Delete</Text></Pressable></View></View><View style={styles.memberTotal}><Text style={styles.smallMuted}>Total recorded contributions</Text><Text style={styles.rowAmount}>{money(total)}</Text></View></View>;
      })}
      {filtered.length === 0 && <Text style={styles.emptyText}>No members match your search.</Text>}
    </ScrollView>
  );
}

function CollectionsPage({ collections, onAdd }) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('All types');
  const filtered = collections.filter((item) => `${item.name} ${item.position}`.toLowerCase().includes(query.toLowerCase()) && (type === 'All types' || item.type === type));
  const total = filtered.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.pageHeading}><View><Text style={styles.eyebrow}>TRANSACTION LEDGER</Text><Text style={styles.pageTitle}>Collections</Text><Text style={styles.muted}>Review every recorded contribution.</Text></View><PrimaryButton title="+ Collection" onPress={onAdd} /></View>
      <View style={styles.summaryRow}><View><Text style={styles.smallMuted}>Showing</Text><Text style={styles.cardTitle}>{filtered.length} records</Text></View><View><Text style={styles.smallMuted}>Filtered total</Text><Text style={styles.cardTitle}>{money(total)}</Text></View></View>
      <TextInput style={styles.searchInput} value={query} onChangeText={setQuery} placeholder="Search by member or position" placeholderTextColor="#a5afc0" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>{['All types', ...COLLECTION_TYPES].map((item) => <Pressable key={item} onPress={() => setType(item)} style={[styles.filterChip, type === item && styles.filterChipActive]}><Text style={[styles.filterText, type === item && styles.filterTextActive]}>{item}</Text></Pressable>)}</ScrollView>
      <View style={styles.panel}>{filtered.length ? filtered.map((item) => <CollectionRow key={item.id} collection={item} />) : <Text style={styles.emptyText}>No collections match your filters.</Text>}</View>
    </ScrollView>
  );
}

function FormModal({ kind, members, initial, onCancel, onSave }) {
  const isMember = kind === 'member';
  const [name, setName] = useState(initial?.name || '');
  const [position, setPosition] = useState(initial?.position || POSITIONS[0]);
  const [memberId, setMemberId] = useState(initial?.memberId || members[0]?.id);
  const [amount, setAmount] = useState(initial?.amount ? String(initial.amount) : '');
  const [type, setType] = useState(initial?.type || COLLECTION_TYPES[0]);
  const [date, setDate] = useState(initial?.date || TODAY);
  const selectedMember = members.find((member) => member.id === memberId);

  const save = () => {
    if (isMember && !name.trim()) return Alert.alert('Name required', 'Enter a member name.');
    if (!isMember && (!memberId || !amount || Number.isNaN(Number(amount)))) return Alert.alert('Collection details required', 'Choose a member and enter a valid amount.');
    if (isMember) {
      const next = { ...initial, id: initial?.id || Date.now(), name: name.trim(), position, photo: initials(name), color: initial?.color || '#5275f5' };
      onSave(next);
    } else {
      onSave({ ...initial, id: initial?.id || Date.now(), memberId, name: selectedMember.name, position: selectedMember.position, photo: selectedMember.photo, color: selectedMember.color, amount: Number(amount), type, date });
    }
  };
  return (
    <Modal transparent animationType="slide" visible onRequestClose={onCancel}>
      <KeyboardAvoidingView style={styles.modalBackdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.modalCard}><View style={styles.rowBetween}><View><Text style={styles.eyebrow}>{isMember ? 'MEMBER DIRECTORY' : 'TRANSACTION LEDGER'}</Text><Text style={styles.modalTitle}>{isMember ? (initial ? 'Edit member profile' : 'Add member profile') : 'Add collection'}</Text></View><Pressable onPress={onCancel}><Text style={styles.closeText}>×</Text></Pressable></View>
          {isMember ? <><Field label="Full name" value={name} onChangeText={setName} placeholder="e.g. Ana Reyes" /><Text style={styles.fieldLabel}>Position</Text><View style={styles.optionWrap}>{POSITIONS.map((item) => <Pressable key={item} onPress={() => setPosition(item)} style={[styles.option, position === item && styles.optionActive]}><Text style={[styles.optionText, position === item && styles.optionTextActive]}>{item}</Text></Pressable>)}</View></> : <><Text style={styles.fieldLabel}>Member</Text><View style={styles.optionWrap}>{members.map((member) => <Pressable key={member.id} onPress={() => setMemberId(member.id)} style={[styles.option, memberId === member.id && styles.optionActive]}><Text style={[styles.optionText, memberId === member.id && styles.optionTextActive]}>{member.name}</Text></Pressable>)}</View><Field label="Amount (PHP)" value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="decimal-pad" /><Text style={styles.fieldLabel}>Collection type</Text><View style={styles.optionWrap}>{COLLECTION_TYPES.map((item) => <Pressable key={item} onPress={() => setType(item)} style={[styles.option, type === item && styles.optionActive]}><Text style={[styles.optionText, type === item && styles.optionTextActive]}>{item}</Text></Pressable>)}</View><Field label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} placeholder={TODAY} /></>}
          <View style={styles.modalActions}><PrimaryButton title="Cancel" secondary onPress={onCancel} /><PrimaryButton title={isMember ? (initial ? 'Save changes' : 'Add member') : 'Add collection'} onPress={save} /></View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function LiquidationPage({ reports, receipts, onUploadReport, onUploadReceipt, onDownload }) {
  const pick = async (kind) => {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      (kind === 'report' ? onUploadReport : onUploadReceipt)({ id: Date.now(), name: asset.name, size: asset.size || 0, uri: asset.uri, addedAt: TODAY });
    }
  };
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.eyebrow}>DOCUMENT CENTER</Text><Text style={styles.pageTitle}>Liquidation Report</Text><Text style={styles.muted}>Upload, preview and share your financial reports.</Text>
      <View style={styles.panel}><Text style={styles.panelTitle}>Keep your reports in one place</Text><Text style={styles.muted}>Choose an Excel or report file from your device.</Text><Pressable style={styles.uploadBox} onPress={() => pick('report')}><Text style={styles.uploadIcon}>↑</Text><Text style={styles.bold}>{reports.length ? reports[0].name : 'Choose a report file'}</Text><Text style={styles.smallMuted}>Tap to upload a document</Text></Pressable>{reports.map((file) => <FileRow key={file.id} file={file} onDownload={onDownload} />)}</View>
      <View style={styles.panel}><View style={styles.rowBetween}><View><Text style={styles.panelTitle}>Receipts</Text><Text style={styles.muted}>Upload and share supporting receipts.</Text></View><Text style={styles.badge}>{receipts.length}</Text></View><Pressable style={styles.receiptButton} onPress={() => pick('receipt')}><Text style={styles.receiptButtonText}>＋ Upload receipt</Text></Pressable>{receipts.length ? receipts.map((file) => <FileRow key={file.id} file={file} onDownload={onDownload} />) : <Text style={styles.emptyText}>No receipts uploaded yet.</Text>}</View>
    </ScrollView>
  );
}

function FileRow({ file, onDownload }) {
  return <View style={styles.fileRow}><View style={styles.fileIcon}><Text>▤</Text></View><View style={styles.fileInfo}><Text style={styles.bold} numberOfLines={1}>{file.name}</Text><Text style={styles.smallMuted}>{file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Ready to share'}</Text></View><Pressable onPress={() => onDownload(file)}><Text style={styles.link}>↧</Text></Pressable></View>;
}

function Workspace({ account, group, setGroup, onLogout }) {
  const [active, setActive] = useState('Dashboard');
  const [members, setMembers] = useState([]);
  const [collections, setCollections] = useState([]);
  const [reports, setReports] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [modal, setModal] = useState(null);
  const theme = GROUPS.find((item) => item.name === group)?.color || '#4169d8';
  const storageKey = (name) => `tkvault-native-${name}-${group}`;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const values = await AsyncStorage.multiGet(['members', 'collections', 'reports', 'receipts'].map(storageKey));
      if (!mounted) return;
      const get = (index, fallback) => { try { return values[index][1] ? JSON.parse(values[index][1]) : fallback; } catch { return fallback; } };
      setMembers(get(0, SEED_MEMBERS));
      setCollections(get(1, SEED_COLLECTIONS));
      setReports(get(2, []));
      setReceipts(get(3, []));
    };
    load();
    return () => { mounted = false; };
  }, [group]);

  useEffect(() => { if (members.length) AsyncStorage.setItem(storageKey('members'), JSON.stringify(members)); }, [members, group]);
  useEffect(() => { if (collections.length) AsyncStorage.setItem(storageKey('collections'), JSON.stringify(collections)); }, [collections, group]);
  useEffect(() => { AsyncStorage.setItem(storageKey('reports'), JSON.stringify(reports)); }, [reports, group]);
  useEffect(() => { AsyncStorage.setItem(storageKey('receipts'), JSON.stringify(receipts)); }, [receipts, group]);

  const saveMember = (member) => { setMembers((current) => member.id && current.some((item) => item.id === member.id) ? current.map((item) => item.id === member.id ? member : item) : [member, ...current]); setCollections((current) => current.map((item) => item.memberId === member.id ? { ...item, name: member.name, position: member.position, photo: member.photo, color: member.color } : item)); setModal(null); };
  const deleteMember = (member) => Alert.alert('Delete member?', `Delete ${member.name} and their recorded collections?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => { setMembers((current) => current.filter((item) => item.id !== member.id)); setCollections((current) => current.filter((item) => item.memberId !== member.id)); } }]);
  const saveCollection = (item) => { setCollections((current) => [item, ...current]); setModal(null); };
  const download = async (file) => {
    if (!file.uri) return Alert.alert('File unavailable', 'This file was saved as metadata only.');
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(file.uri, { dialogTitle: `Share ${file.name}` });
    else Alert.alert('Download ready', `${file.name} is available in the device file picker.`);
  };

  return (
    <SafeAreaView style={styles.page}>
      <Header group={group} account={account} onLogout={onLogout} />
      <View style={[styles.themeStrip, { backgroundColor: theme }]} />
      <Navigation active={active} setActive={setActive} />
      {active === 'Dashboard' && <Dashboard collections={collections} group={group} onAddCollection={() => setModal('collection')} onViewCollections={() => setActive('Collections')} />}
      {active === "Member's Profile" && <MembersPage members={members} collections={collections} onAdd={() => setModal('member')} onEdit={(member) => setModal({ kind: 'member', initial: member })} onDelete={deleteMember} />}
      {active === 'Collections' && <CollectionsPage collections={collections} onAdd={() => setModal('collection')} />}
      {active === 'Liquidation Report' && <LiquidationPage reports={reports} receipts={receipts} onUploadReport={(file) => setReports((current) => [file, ...current])} onUploadReceipt={(file) => setReceipts((current) => [file, ...current])} onDownload={download} />}
      {modal && <FormModal kind={modal.kind || modal} initial={modal.initial} members={members} onCancel={() => setModal(null)} onSave={modal.kind === 'member' || modal === 'member' ? saveMember : saveCollection} />}
    </SafeAreaView>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState(null);
  const [group, setGroup] = useState('');
  const [signup, setSignup] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('tkvault-native-account').then((value) => {
      if (value) setAccount(JSON.parse(value));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const login = (nextAccount) => { setAccount(nextAccount); AsyncStorage.setItem('tkvault-native-account', JSON.stringify(nextAccount)); if (nextAccount.role === 'group') setGroup(nextAccount.group); };
  const logout = () => { setAccount(null); setGroup(''); AsyncStorage.removeItem('tkvault-native-account'); };
  if (loading) return <View style={styles.loading}><ActivityIndicator color={COLORS.navy} /><Text style={styles.muted}>Opening your vault…</Text></View>;
  if (!account) return signup ? <SignupScreen onBack={() => setSignup(false)} /> : <LoginScreen onLogin={login} onSignup={() => setSignup(true)} />;
  if (account.role === 'administrator' && !group) return <GroupPicker account={account} onSelect={setGroup} onLogout={logout} />;
  return <Workspace account={account} group={group} setGroup={setGroup} onLogout={logout} />;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.background },
  loading: { alignItems: 'center', backgroundColor: COLORS.background, flex: 1, justifyContent: 'center', gap: 12 },
  authPage: { backgroundColor: COLORS.navy, flex: 1 },
  authContent: { flexGrow: 1, padding: 24 },
  authHero: { paddingVertical: 34 },
  logo: { alignItems: 'center', flexDirection: 'row', gap: 9 },
  logoMark: { backgroundColor: COLORS.gold, borderRadius: 8, color: COLORS.navy, fontSize: 11, fontWeight: '800', overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 8 },
  logoText: { color: COLORS.white, fontSize: 20, fontWeight: '800' },
  heroEyebrow: { color: '#96a8ce', fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginTop: 54 },
  heroTitle: { color: COLORS.white, fontSize: 36, fontWeight: '800', lineHeight: 44, marginTop: 15 },
  goldText: { color: COLORS.gold },
  heroCopy: { color: '#aab7d1', fontSize: 15, lineHeight: 23, marginTop: 14 },
  authCard: { backgroundColor: COLORS.white, borderRadius: 18, padding: 24 },
  eyebrow: { color: COLORS.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1.4 },
  screenTitle: { color: COLORS.ink, fontSize: 27, fontWeight: '800', lineHeight: 34, marginTop: 12 },
  muted: { color: COLORS.muted, fontSize: 13, lineHeight: 20 },
  formSpace: { marginTop: 28 },
  field: { marginBottom: 15 },
  fieldLabel: { color: '#46516b', fontSize: 12, fontWeight: '700', marginBottom: 7 },
  input: { backgroundColor: COLORS.white, borderColor: '#e1e5ee', borderRadius: 9, borderWidth: 1, color: COLORS.ink, fontSize: 14, paddingHorizontal: 13, paddingVertical: 12 },
  primaryButton: { alignItems: 'center', backgroundColor: '#4169d8', borderRadius: 9, justifyContent: 'center', minHeight: 46, paddingHorizontal: 16, shadowColor: '#0b1938', shadowOpacity: 0.12, shadowRadius: 7, elevation: 2 },
  primaryButtonText: { color: COLORS.white, fontSize: 13, fontWeight: '800' },
  secondaryButton: { backgroundColor: '#f0f3f8', shadowOpacity: 0 },
  secondaryButtonText: { color: '#657089' },
  error: { color: '#c54848', fontSize: 12, marginBottom: 12 },
  demoHint: { backgroundColor: '#fbf7e9', borderRadius: 8, marginTop: 18, padding: 11 },
  demoText: { color: '#8c7331', fontSize: 11, textAlign: 'center' },
  linkButton: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginTop: 25 },
  link: { color: '#4169d8', fontSize: 12, fontWeight: '800' },
  groupPicker: { padding: 24 },
  rowBetween: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  centerIntro: { alignItems: 'center', marginBottom: 27, marginTop: 70 },
  groupGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  groupButton: { alignItems: 'center', borderRadius: 10, flexDirection: 'row', minHeight: 58, paddingHorizontal: 12, width: '31%' },
  groupDot: { backgroundColor: 'rgba(255,255,255,.75)', borderColor: 'rgba(255,255,255,.3)', borderRadius: 8, borderWidth: 3, height: 12, marginRight: 7, width: 12 },
  groupButtonText: { color: COLORS.white, flex: 1, fontSize: 11, fontWeight: '800' },
  groupArrow: { color: COLORS.white, fontSize: 17, opacity: 0.8 },
  footerNote: { color: '#9ca6b8', fontSize: 11, marginTop: 27, textAlign: 'center' },
  header: { alignItems: 'center', backgroundColor: COLORS.white, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 15 },
  headerTitle: { color: COLORS.ink, fontSize: 16, fontWeight: '800', marginTop: 3 },
  headerAvatar: { alignItems: 'center', backgroundColor: COLORS.gold, borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  headerAvatarText: { color: COLORS.navy, fontSize: 12, fontWeight: '800' },
  themeStrip: { height: 4 },
  navBar: { backgroundColor: COLORS.white, borderBottomColor: COLORS.line, borderBottomWidth: 1, paddingHorizontal: 10 },
  navItem: { alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent', minWidth: 82, paddingHorizontal: 6, paddingVertical: 10 },
  navItemActive: { borderBottomColor: '#4169d8' },
  navIcon: { color: COLORS.muted, fontSize: 17, marginBottom: 3 },
  navText: { color: COLORS.muted, fontSize: 10, fontWeight: '700', textAlign: 'center' },
  navTextActive: { color: '#4169d8' },
  content: { gap: 15, padding: 18, paddingBottom: 36 },
  pageHeading: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  pageTitle: { color: COLORS.ink, fontSize: 25, fontWeight: '800', marginVertical: 5 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { backgroundColor: COLORS.white, borderRadius: 12, borderTopWidth: 4, borderTopColor: '#e7ebf2', minHeight: 132, padding: 13, width: '48%' },
  statIcon: { color: '#4169d8', fontSize: 18, fontWeight: '800' },
  statTitle: { color: COLORS.muted, fontSize: 11, marginTop: 11 },
  statAmount: { color: COLORS.ink, fontSize: 19, fontWeight: '800', marginTop: 5 },
  statCaption: { color: '#a0a9b9', fontSize: 9, marginTop: 5 },
  whiteText: { color: COLORS.white },
  panel: { backgroundColor: COLORS.white, borderRadius: 12, padding: 16 },
  panelTitle: { color: COLORS.ink, fontSize: 16, fontWeight: '800', marginBottom: 3 },
  collectionRow: { alignItems: 'center', borderBottomColor: COLORS.line, borderBottomWidth: 1, flexDirection: 'row', gap: 10, paddingVertical: 12 },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: COLORS.white, fontSize: 12, fontWeight: '800' },
  collectionPerson: { flex: 1 },
  bold: { color: COLORS.ink, fontSize: 12, fontWeight: '800' },
  smallMuted: { color: COLORS.muted, fontSize: 10, marginTop: 3 },
  rowAmount: { color: COLORS.ink, fontSize: 13, fontWeight: '800', textAlign: 'right' },
  emptyText: { color: COLORS.muted, fontSize: 13, paddingVertical: 18, textAlign: 'center' },
  tipCard: { backgroundColor: COLORS.white, borderLeftWidth: 4, borderRadius: 10, padding: 16 },
  tipTitle: { color: COLORS.ink, fontSize: 13, fontWeight: '800' },
  tipAmount: { color: COLORS.ink, fontSize: 20, fontWeight: '800', marginTop: 7 },
  progressTrack: { backgroundColor: '#edf0f5', borderRadius: 5, height: 8, marginTop: 14, overflow: 'hidden' },
  progressBar: { borderRadius: 5, height: 8 },
  searchInput: { backgroundColor: COLORS.white, borderColor: COLORS.line, borderRadius: 9, borderWidth: 1, color: COLORS.ink, fontSize: 13, padding: 12 },
  memberCard: { backgroundColor: COLORS.white, borderRadius: 12, padding: 15 },
  memberIdentity: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  cardTitle: { color: COLORS.ink, fontSize: 13, fontWeight: '800' },
  actionRow: { alignItems: 'center', flexDirection: 'row', gap: 14 },
  dangerText: { color: '#c54848', fontSize: 12, fontWeight: '800' },
  memberTotal: { borderTopColor: COLORS.line, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, paddingTop: 11 },
  summaryRow: { backgroundColor: '#edf2ff', borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', padding: 14 },
  filterRow: { gap: 7 },
  filterChip: { borderColor: COLORS.line, borderRadius: 16, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  filterChipActive: { backgroundColor: COLORS.navy, borderColor: COLORS.navy },
  filterText: { color: COLORS.muted, fontSize: 10, fontWeight: '700' },
  filterTextActive: { color: COLORS.white },
  modalBackdrop: { backgroundColor: 'rgba(11,25,56,.55)', flex: 1, justifyContent: 'flex-end' },
  modalCard: { backgroundColor: COLORS.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '92%', padding: 20 },
  modalTitle: { color: COLORS.ink, fontSize: 21, fontWeight: '800', marginTop: 5 },
  closeText: { color: COLORS.muted, fontSize: 30, fontWeight: '300' },
  optionWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 15, marginTop: 7 },
  option: { backgroundColor: '#f1f3f7', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 9 },
  optionActive: { backgroundColor: COLORS.navy },
  optionText: { color: COLORS.muted, fontSize: 11, fontWeight: '700' },
  optionTextActive: { color: COLORS.white },
  modalActions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end', marginTop: 4 },
  uploadBox: { alignItems: 'center', backgroundColor: '#f7f9fd', borderColor: '#bdc9e4', borderRadius: 10, borderStyle: 'dashed', borderWidth: 1, marginTop: 15, padding: 22 },
  uploadIcon: { color: '#4169d8', fontSize: 25, fontWeight: '800' },
  receiptButton: { backgroundColor: '#edf2ff', borderRadius: 8, marginTop: 16, padding: 12 },
  receiptButtonText: { color: '#4169d8', fontSize: 12, fontWeight: '800', textAlign: 'center' },
  badge: { backgroundColor: '#edf2ff', borderRadius: 14, color: '#4169d8', fontSize: 12, fontWeight: '800', overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 6 },
  fileRow: { alignItems: 'center', borderBottomColor: COLORS.line, borderBottomWidth: 1, flexDirection: 'row', gap: 10, paddingVertical: 12 },
  fileIcon: { alignItems: 'center', backgroundColor: '#edf2ff', borderRadius: 7, height: 34, justifyContent: 'center', width: 34 },
  fileInfo: { flex: 1 },
});
