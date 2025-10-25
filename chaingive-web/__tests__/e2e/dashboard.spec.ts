import { test, expect } from '@playwright/test';

test.describe('Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/dashboard');

    // Mock authentication state
    await page.addScriptTag({
      content: `
        window.localStorage.setItem('auth_token', 'mock-jwt-token');
        window.localStorage.setItem('user', JSON.stringify({
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com'
        }));
      `,
    });

    // Reload to apply auth state
    await page.reload();
  });

  test('should display dashboard overview with key metrics', async ({ page }) => {
    // Check main dashboard elements
    await expect(page.locator('h2').filter({ hasText: 'ChainGive' })).toBeVisible();

    // Check tab navigation
    const tabs = ['Overview', 'AI Matching', 'My Impact', 'Events', 'Community', 'Security'];
    for (const tabName of tabs) {
      await expect(page.locator('button').filter({ hasText: tabName })).toBeVisible();
    }

    // Check overview metrics cards
    await expect(page.locator('text=Total Balance')).toBeVisible();
    await expect(page.locator('text=Transactions')).toBeVisible();
    await expect(page.locator('text=Status')).toBeVisible();

    // Check recent transactions section
    await expect(page.locator('text=Recent Transactions')).toBeVisible();
  });

  test('should navigate between dashboard tabs', async ({ page }) => {
    // Test AI Matching tab
    await page.locator('button').filter({ hasText: 'AI Matching' }).click();
    await expect(page.locator('h2').filter({ hasText: 'AI Matching Dashboard' })).toBeVisible();

    // Test My Impact tab
    await page.locator('button').filter({ hasText: 'My Impact' }).click();
    await expect(page.locator('h2').filter({ hasText: 'My Impact Analytics' })).toBeVisible();

    // Test Events tab
    await page.locator('button').filter({ hasText: 'Events' }).click();
    await expect(page.locator('h2').filter({ hasText: 'Community Events' })).toBeVisible();

    // Test Community tab
    await page.locator('button').filter({ hasText: 'Community' }).click();
    await expect(page.locator('h2').filter({ hasText: 'Community Feed' })).toBeVisible();

    // Test Security tab
    await page.locator('button').filter({ hasText: 'Security' }).click();
    await expect(page.locator('h2').filter({ hasText: 'Fraud Detection Dashboard' })).toBeVisible();

    // Return to Overview
    await page.locator('button').filter({ hasText: 'Overview' }).click();
    await expect(page.locator('text=Total Balance')).toBeVisible();
  });

  test('should handle biometric authentication flow', async ({ page }) => {
    // Navigate to security tab
    await page.locator('button').filter({ hasText: 'Security' }).click();

    // Mock WebAuthn support
    await page.addScriptTag({
      content: `
        navigator.credentials = {
          create: async () => ({ type: 'public-key' }),
          get: async () => ({ type: 'public-key' })
        };
        window.PublicKeyCredential = {
          isUserVerifyingPlatformAuthenticatorAvailable: async () => true
        };
      `,
    });

    // Check biometric status display
    await expect(page.locator('text=Fraud Detection Dashboard')).toBeVisible();

    // Mock biometric registration success
    await page.route('/api/v1/biometric/status', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            hasBiometric: true,
            devices: [{ id: 'device-1', name: 'Test Device' }],
            lastUsed: new Date().toISOString()
          }
        })
      });
    });

    // Reload to check biometric status
    await page.reload();
    await page.locator('button').filter({ hasText: 'Security' }).click();
  });

  test('should display AI matching interface', async ({ page }) => {
    // Navigate to AI Matching tab
    await page.locator('button').filter({ hasText: 'AI Matching' }).click();

    // Mock matching API response
    await page.route('/api/v1/matching/stats', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            totalMatches: 150,
            successfulMatches: 120,
            averageMatchScore: 0.85,
            matchesByCategory: {
              medical: 45,
              education: 38,
              business: 27,
              emergency: 40
            },
            recentActivity: [
              {
                type: 'match',
                description: 'New match found for medical assistance',
                timestamp: new Date().toISOString()
              }
            ]
          }
        })
      });
    });

    await page.route('/api/v1/matching/recommend?**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            match: {
              id: 'match-123',
              recipientId: 'recipient-456',
              recipientName: 'John Doe',
              recipientLocation: 'Lagos, Nigeria',
              amount: 25000,
              category: 'medical',
              message: 'Need help with medical bills for surgery',
              trustScore: 0.92,
              matchScore: 0.88,
              urgency: 'high',
              timeWaiting: 7,
              aiRecommendation: 'High match score due to location proximity and urgent medical need'
            }
          }
        })
      });
    });

    // Check statistics display
    await expect(page.locator('text=Total Matches')).toBeVisible();
    await expect(page.locator('text=150')).toBeVisible();

    // Check matching interface
    await expect(page.locator('text=AI Recommended Match')).toBeVisible();
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=₦25,000')).toBeVisible();

    // Test action buttons
    await expect(page.locator('button').filter({ hasText: 'Accept & Donate' })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: 'Skip This Match' })).toBeVisible();
  });

  test('should display analytics dashboard with charts', async ({ page }) => {
    // Navigate to My Impact tab
    await page.locator('button').filter({ hasText: 'My Impact' }).click();

    // Mock analytics API response
    await page.route('/api/v1/analytics/impact?timeframe=month', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            userId: 'user-123',
            timeframe: 'month',
            metrics: {
              totalDonated: 150000,
              peopleHelped: 12,
              rankingsPosition: 85,
              coinsEarned: 1500,
              averageDonation: 12500,
              donationFrequency: 2.5,
              impactScore: 0.87,
              communityRank: 45
            },
            charts: {
              donationTrend: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                data: [25000, 35000, 45000, 45000]
              },
              categoryBreakdown: [
                { category: 'Medical', amount: 75000, percentage: 50, count: 6 },
                { category: 'Education', amount: 45000, percentage: 30, count: 4 },
                { category: 'Business', amount: 22500, percentage: 15, count: 2 },
                { category: 'Emergency', amount: 7500, percentage: 5, count: 1 }
              ],
              monthlyGoal: {
                current: 125000,
                target: 200000,
                percentage: 62.5,
                daysLeft: 12
              }
            },
            impactStories: [
              {
                id: 'story-1',
                recipientName: 'Sarah Johnson',
                message: 'Your donation helped me pay for my mother\'s medical treatment. Thank you!',
                category: 'medical',
                amount: 30000,
                timeAgo: '2 weeks ago',
                location: 'Lagos, Nigeria'
              }
            ],
            achievements: [],
            recommendations: [
              'Consider increasing your monthly donation goal',
              'Try matching in the education category for higher impact'
            ],
            lastUpdated: new Date().toISOString()
          }
        })
      });
    });

    // Check metrics display
    await expect(page.locator('text=Total Donated')).toBeVisible();
    await expect(page.locator('text=₦150,000')).toBeVisible();
    await expect(page.locator('text=People Helped')).toBeVisible();
    await expect(page.locator('text=12')).toBeVisible();

    // Check chart containers (charts may not render in headless mode)
    await expect(page.locator('text=Donation Trend')).toBeVisible();
    await expect(page.locator('text=Category Breakdown')).toBeVisible();

    // Check monthly goal progress
    await expect(page.locator('text=Monthly Goal Progress')).toBeVisible();
    await expect(page.locator('text=62.5% Complete')).toBeVisible();

    // Check impact stories
    await expect(page.locator('text=Recent Impact Stories')).toBeVisible();
    await expect(page.locator('text=Sarah Johnson')).toBeVisible();
  });

  test('should handle event management functionality', async ({ page }) => {
    // Navigate to Events tab
    await page.locator('button').filter({ hasText: 'Events' }).click();

    // Mock events API response
    await page.route('/api/v1/events', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            events: [
              {
                id: 'event-1',
                title: 'Community Health Drive',
                description: 'Free medical checkups for community members',
                category: 'health',
                location: 'Lagos Community Center',
                startDate: '2025-02-15T10:00:00Z',
                endDate: '2025-02-15T16:00:00Z',
                maxAttendees: 100,
                currentAttendees: 67,
                organizerId: 'org-123',
                organizerName: 'Health NGO',
                status: 'published',
                isVirtual: false,
                donationGoal: 500000,
                currentDonations: 325000,
                tags: ['health', 'community', 'medical'],
                createdAt: '2025-01-15T08:00:00Z',
                updatedAt: '2025-01-20T14:30:00Z'
              }
            ]
          }
        })
      });
    });

    // Check events display
    await expect(page.locator('text=Community Events')).toBeVisible();
    await expect(page.locator('text=Your Events')).toBeVisible();
    await expect(page.locator('text=Community Health Drive')).toBeVisible();

    // Test create event button
    await expect(page.locator('button').filter({ hasText: 'Create Event' })).toBeVisible();
  });

  test('should display community feed with posts', async ({ page }) => {
    // Navigate to Community tab
    await page.locator('button').filter({ hasText: 'Community' }).click();

    // Mock community feed API response
    await page.route('/api/v1/community/feed?page=1&limit=20&timeframe=week', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            posts: [
              {
                id: 'post-1',
                type: 'story',
                authorId: 'user-456',
                authorName: 'Community Member',
                title: 'My Impact Story',
                content: 'Thanks to ChainGive, I was able to pay for my children\'s school fees...',
                tags: ['education', 'impact'],
                likes: 24,
                comments: 8,
                shares: 5,
                isLiked: false,
                isBookmarked: false,
                createdAt: '2025-01-20T10:30:00Z',
                updatedAt: '2025-01-20T10:30:00Z',
                donationDetails: {
                  amount: 45000,
                  recipientName: 'School Fund',
                  category: 'education'
                }
              }
            ]
          }
        })
      });
    });

    // Check feed display
    await expect(page.locator('text=Community Feed')).toBeVisible();
    await expect(page.locator('text=My Impact Story')).toBeVisible();
    await expect(page.locator('text=Community Member')).toBeVisible();

    // Check interaction buttons
    await expect(page.locator('button').filter({ hasText: 'Create Post' })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: 'Filters' })).toBeVisible();
  });

  test('should handle user logout', async ({ page }) => {
    // Check logout button is visible
    await expect(page.locator('button').filter({ hasText: 'Logout' })).toBeVisible();

    // Mock logout API
    await page.route('/api/v1/auth/logout', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { success: true } })
      });
    });

    // Click logout
    await page.locator('button').filter({ hasText: 'Logout' }).click();

    // Should redirect to login (this would be handled by the app's routing)
    // In a real test, we'd check for navigation to /login
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error for matching stats
    await page.route('/api/v1/matching/stats', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Internal server error'
        })
      });
    });

    // Navigate to AI Matching tab
    await page.locator('button').filter({ hasText: 'AI Matching' }).click();

    // Should still display the interface (error handling should be graceful)
    await expect(page.locator('text=AI Matching Dashboard')).toBeVisible();
  });
});