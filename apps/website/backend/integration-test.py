#!/usr/bin/env python3
"""
Flask Session Manager Integration Test
Tests the complete session management system including:
- Health checks
- Authentication flow
- Session validation
- Rate limiting
- Keep-alive functionality
- Logout and cleanup
"""

import requests
import time
import json
from typing import Dict, Optional

class SessionManagerTest:
    def __init__(self, base_url: str = "http://localhost:5001"):
        self.base_url = base_url
        self.session_id: Optional[str] = None
        self.test_user = {
            "username": "admin",  # Assuming admin user exists
            "password": "admin123"  # Test password
        }
    
    def test_health_check(self) -> bool:
        """Test the health endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/admin/health", timeout=5)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Health check passed: {data}")
                return True
            else:
                print(f"❌ Health check failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Health check error: {e}")
            return False
    
    def test_login(self) -> bool:
        """Test login endpoint"""
        try:
            response = requests.post(
                f"{self.base_url}/api/admin/login",
                json=self.test_user,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('authenticated'):
                    self.session_id = response.headers.get('X-Session-ID')
                    print(f"✅ Login successful: {data['user']['username']}")
                    print(f"🔑 Session ID: {self.session_id[:16]}...")
                    return True
                else:
                    print(f"❌ Login failed: {data.get('error', 'Unknown error')}")
                    return False
            else:
                print(f"❌ Login HTTP error: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Login error: {e}")
            return False
    
    def test_session_validation(self) -> bool:
        """Test session validation endpoint"""
        if not self.session_id:
            print("❌ No session ID available for validation test")
            return False
        
        try:
            response = requests.get(
                f"{self.base_url}/api/admin/check-session",
                headers={
                    "X-Session-ID": self.session_id,
                    "Content-Type": "application/json"
                },
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('authenticated'):
                    print(f"✅ Session validation successful: {data['user']['username']}")
                    return True
                else:
                    print("❌ Session validation failed: Not authenticated")
                    return False
            else:
                print(f"❌ Session validation HTTP error: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Session validation error: {e}")
            return False
    
    def test_keep_alive(self) -> bool:
        """Test keep-alive endpoint"""
        if not self.session_id:
            print("❌ No session ID available for keep-alive test")
            return False
        
        try:
            response = requests.post(
                f"{self.base_url}/api/admin/keep-alive",
                headers={
                    "X-Session-ID": self.session_id,
                    "Content-Type": "application/json"
                },
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Keep-alive successful: {data}")
                return True
            else:
                print(f"❌ Keep-alive HTTP error: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Keep-alive error: {e}")
            return False
    
    def test_logout(self) -> bool:
        """Test logout endpoint"""
        if not self.session_id:
            print("❌ No session ID available for logout test")
            return False
        
        try:
            response = requests.post(
                f"{self.base_url}/api/admin/logout",
                headers={
                    "X-Session-ID": self.session_id,
                    "Content-Type": "application/json"
                },
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Logout successful: {data}")
                self.session_id = None
                return True
            else:
                print(f"❌ Logout HTTP error: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Logout error: {e}")
            return False
    
    def test_rate_limiting(self) -> bool:
        """Test rate limiting functionality"""
        print("🧪 Testing rate limiting (5 failed attempts expected)...")
        
        for i in range(6):
            try:
                response = requests.post(
                    f"{self.base_url}/api/admin/login",
                    json={"username": "invalid", "password": "invalid"},
                    headers={"Content-Type": "application/json"},
                    timeout=5
                )
                
                if i < 5:
                    expected_status = 401
                    print(f"Attempt {i+1}: Status {response.status_code} (expected {expected_status})")
                else:
                    expected_status = 429
                    if response.status_code == 429:
                        print(f"✅ Rate limiting activated on attempt {i+1}")
                        return True
                    else:
                        print(f"❌ Rate limiting failed on attempt {i+1}: {response.status_code}")
                        return False
                        
            except Exception as e:
                print(f"❌ Rate limiting test error on attempt {i+1}: {e}")
                return False
        
        return False
    
    def run_all_tests(self) -> Dict[str, bool]:
        """Run all integration tests"""
        print("🚀 Starting Flask Session Manager Integration Tests\n")
        
        results = {
            "health_check": self.test_health_check(),
            "login": self.test_login(),
            "session_validation": self.test_session_validation(),
            "keep_alive": self.test_keep_alive(),
            "logout": self.test_logout(),
            "rate_limiting": self.test_rate_limiting()
        }
        
        print("\n📊 Test Results Summary:")
        for test_name, result in results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"  {test_name.replace('_', ' ').title()}: {status}")
        
        passed = sum(results.values())
        total = len(results)
        print(f"\n🎯 Overall: {passed}/{total} tests passed")
        
        return results

if __name__ == "__main__":
    tester = SessionManagerTest()
    results = tester.run_all_tests()
    
    if all(results.values()):
        print("\n🎉 All tests passed! Flask Session Manager integration is working correctly.")
        exit(0)
    else:
        print("\n⚠️  Some tests failed. Please check the configuration.")
        exit(1)
