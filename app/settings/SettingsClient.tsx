'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, User, Bell, Shield, Mail, LogOut, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getCurrentUser, signOut } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useTypedTranslations } from '@/lib/i18n/useTranslations';

export default function SettingsClient() {
  const router = useRouter();
  const { t } = useTypedTranslations();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // プロフィール設定
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [twitter, setTwitter] = useState('');
  const [github, setGithub] = useState('');
  
  // 通知設定
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [upvoteNotifications, setUpvoteNotifications] = useState(true);
  const [commentNotifications, setCommentNotifications] = useState(true);
  const [followNotifications, setFollowNotifications] = useState(true);
  
  // プライバシー設定
  const [profilePublic, setProfilePublic] = useState(true);
  const [showEmail, setShowEmail] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        router.push('/auth/signin');
        return;
      }
      
      setCurrentUser(user);
      setUsername(user.username || '');
      setEmail(user.email || '');
      setBio(user.bio || '');
      setWebsite(user.website || '');
      setTwitter(user.twitter || '');
      setGithub(user.github || '');

      const supabase = createClient();
      
      // 通知設定の読み込み
      const { data: settings } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (settings) {
        setEmailNotifications(settings.email_notifications ?? true);
        setUpvoteNotifications(settings.upvote_notifications ?? true);
        setCommentNotifications(settings.comment_notifications ?? true);
        setFollowNotifications(settings.follow_notifications ?? true);
        setProfilePublic(settings.profile_public ?? true);
        setShowEmail(settings.show_email ?? false);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error(t.settings.loadingError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('profiles')
        .update({
          username,
          bio,
          website,
          twitter,
          github,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);

      if (error) throw error;
      
      toast.success(t.settings.profileSaveSuccess);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error(t.settings.profileSaveError);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: currentUser.id,
          email_notifications: emailNotifications,
          upvote_notifications: upvoteNotifications,
          comment_notifications: commentNotifications,
          follow_notifications: followNotifications,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      toast.success(t.settings.notificationSaveSuccess);
    } catch (error: any) {
      console.error('Error saving notifications:', error);
      toast.error(t.settings.notificationSaveError);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePrivacy = async () => {
    setIsSaving(true);
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: currentUser.id,
          profile_public: profilePublic,
          show_email: showEmail,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      toast.success(t.settings.privacySaveSuccess);
    } catch (error: any) {
      console.error('Error saving privacy:', error);
      toast.error(t.settings.privacySaveError);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.settings.title}</h1>
          <p className="text-gray-600">
            {t.settings.description}
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              {t.settings.profile}
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              {t.settings.notifications}
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="w-4 h-4 mr-2" />
              {t.settings.privacy}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.settings.profileInfo}</CardTitle>
                <CardDescription>
                  {t.settings.profileInfoDescription}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={currentUser?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl">
                      {username?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline">
                    {t.settings.changeAvatar}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">{t.settings.username}</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t.settings.usernamePlaceholder}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t.settings.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.settings.emailPlaceholder}
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">{t.settings.bio}</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder={t.settings.bioPlaceholder}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">{t.settings.website}</Label>
                  <Input
                    id="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder={t.settings.websitePlaceholder}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="twitter">{t.settings.twitter}</Label>
                    <Input
                      id="twitter"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      placeholder={t.settings.twitterPlaceholder}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="github">{t.settings.github}</Label>
                    <Input
                      id="github"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder={t.settings.githubPlaceholder}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {isSaving ? t.settings.saving : t.settings.save}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.settings.notificationSettings}</CardTitle>
                <CardDescription>
                  {t.settings.notificationSettingsDescription}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t.settings.emailNotifications}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t.settings.emailNotificationsDescription}
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t.settings.upvoteNotifications}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t.settings.upvoteNotificationsDescription}
                    </p>
                  </div>
                  <Switch
                    checked={upvoteNotifications}
                    onCheckedChange={setUpvoteNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t.settings.commentNotifications}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t.settings.commentNotificationsDescription}
                    </p>
                  </div>
                  <Switch
                    checked={commentNotifications}
                    onCheckedChange={setCommentNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t.settings.followNotifications}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t.settings.followNotificationsDescription}
                    </p>
                  </div>
                  <Switch
                    checked={followNotifications}
                    onCheckedChange={setFollowNotifications}
                  />
                </div>

                <Button 
                  onClick={handleSaveNotifications}
                  disabled={isSaving}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {isSaving ? t.settings.saving : t.settings.save}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.settings.privacySettings}</CardTitle>
                <CardDescription>
                  {t.settings.privacySettingsDescription}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t.settings.profilePublic}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t.settings.profilePublicDescription}
                    </p>
                  </div>
                  <Switch
                    checked={profilePublic}
                    onCheckedChange={setProfilePublic}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t.settings.showEmail}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t.settings.showEmailDescription}
                    </p>
                  </div>
                  <Switch
                    checked={showEmail}
                    onCheckedChange={setShowEmail}
                  />
                </div>

                <Button 
                  onClick={handleSavePrivacy}
                  disabled={isSaving}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {isSaving ? t.settings.saving : t.settings.save}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">{t.settings.deleteAccount}</CardTitle>
                <CardDescription>
                  {t.settings.deleteAccountDescription}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" className="w-full">
                  {t.settings.deleteAccountButton}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

        <div className="mt-8 pt-8 border-t">
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t.settings.signOut}
          </Button>
        </div>
      </main>
    </div>
  );
}
