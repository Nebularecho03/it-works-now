from __future__ import annotations

import cgi
import json
from http import HTTPStatus
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any
from urllib.parse import urlparse

import config, storage
from database import db
from security import verify_password, verify_totp, generate_session_token


SESSION_COOKIE_NAME = "admin_session"
MAX_UPLOAD_BYTES = 10 * 1024 * 1024
ALLOWED_UPLOAD_TYPES = {
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
}


class AdminRequestHandler(BaseHTTPRequestHandler):
  server_version = "StephenAdmin/0.1"

  def end_headers(self) -> None:
    self._write_cors_headers()
    super().end_headers()

  def _write_cors_headers(self) -> None:
    origin = self.headers.get("Origin")
    # Allow localhost origins for development
    # Also allow cloudflared tunnel URLs for production
    if origin and (origin == config.DEFAULT_ALLOWED_ORIGIN or 
                  origin.startswith("http://localhost:") or 
                  origin.startswith("http://127.0.0.1:") or
                  origin.startswith("https://") and ".trycloudflare.com" in origin):
      self.send_header("Access-Control-Allow-Origin", origin)
      self.send_header("Vary", "Origin")
      self.send_header("Access-Control-Allow-Credentials", "true")
      self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
      self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    elif not origin:
      # Allow requests without Origin header (like curl)
      self.send_header("Access-Control-Allow-Origin", "*")
      self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
      self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")

  def _json_response(self, status: int, payload: dict[str, Any]) -> None:
    body = json.dumps(payload, ensure_ascii=True).encode("utf-8")
    self.send_response(status)
    self.send_header("Content-Type", "application/json; charset=utf-8")
    self.send_header("Content-Length", str(len(body)))
    self.end_headers()
    self.wfile.write(body)

  def _read_json_body(self) -> dict[str, Any]:
    length = int(self.headers.get("Content-Length", "0"))
    raw = self.rfile.read(length) if length > 0 else b"{}"
    return json.loads(raw.decode("utf-8"))

  def _get_session_token(self) -> str | None:
    cookie_header = self.headers.get("Cookie")
    if not cookie_header:
      return None
    cookies = SimpleCookie()
    cookies.load(cookie_header)
    cookie = cookies.get(SESSION_COOKIE_NAME)
    return cookie.value if cookie else None

  def _get_current_user(self) -> dict[str, Any] | None:
    token = self._get_session_token()
    if not token:
      return None
    session = db.get_session(token)
    if not session:
      return None
    # Get full user data from database to include phone number and email
    user_data = db.get_user_by_username(session["username"])
    return {
      "username": session["username"],
      "displayName": session["display_name"],
      "role": session["role"],
      "phoneNumber": user_data.get("phone_number") if user_data else "",
      "email": user_data.get("email") if user_data else "",
      "session": session,
    }

  def _require_user(self) -> dict[str, Any] | None:
    user = self._get_current_user()
    if not user:
      self._json_response(HTTPStatus.UNAUTHORIZED, {"error": "Authentication required"})
      return None
    return user

  def _get_query_param(self, name: str, default: str | None = None) -> str | None:
    """Get a query parameter from the URL"""
    parsed = urlparse(self.path)
    query_params = dict(qc.split('=') for qc in parsed.query.split('&') if qc)
    return query_params.get(name, default)

  def _set_session_cookie(self, token: str, *, max_age: int) -> None:
    cookie = SimpleCookie()
    cookie[SESSION_COOKIE_NAME] = token
    cookie[SESSION_COOKIE_NAME]["path"] = "/"
    cookie[SESSION_COOKIE_NAME]["httponly"] = True
    cookie[SESSION_COOKIE_NAME]["samesite"] = "Lax"
    cookie[SESSION_COOKIE_NAME]["max-age"] = str(max_age)
    self.send_header("Set-Cookie", cookie.output(header="").strip())

  def do_OPTIONS(self) -> None:
    self.send_response(HTTPStatus.NO_CONTENT)
    self.end_headers()

  def do_GET(self) -> None:
    path = urlparse(self.path).path

    if path == "/api/health":
      self._json_response(HTTPStatus.OK, {"status": "ok"})
      return

    if path == "/api/gallery/photos":
      # Return media items that are images for the gallery (public endpoint)
      media_items = storage.list_media()
      # Filter for image files only and format for gallery
      photos = []
      for item in media_items:
        if item.get("content_type", "").startswith("image/"):
          photos.append({
            "id": item["id"],
            "title": item.get("filename", "Untitled"),
            "description": "",
            "image_url": f"/uploads/admin/{item['filename']}",
            "thumbnail_url": f"/uploads/admin/{item['filename']}",
            "upload_date": item.get("uploaded_at", ""),
            "file_size": item.get("file_size", 0),
            "dimensions": {"width": 1200, "height": 900},  # Default dimensions
            "category": "gallery",
            "tags": [],
            "uploaded_by": item.get("uploaded_by", "admin"),
            "filename": item.get("filename", "")
          })
      self._json_response(HTTPStatus.OK, {"photos": photos})
      return

    if path == "/api/auth/me":
      user = self._get_current_user()
      if not user:
        self._json_response(HTTPStatus.OK, {"authenticated": False})
        return
      self._json_response(
        HTTPStatus.OK,
        {
          "authenticated": True,
          "user": {
            "username": user["username"],
            "displayName": user["displayName"],
            "role": user["role"],
            "mfaConfigured": bool(config.DEFAULT_ADMIN_TOTP_SECRET),
            "phoneNumber": user.get("phoneNumber") or "",
            "email": user.get("email") or "",
          },
        },
      )
      return

    user = self._require_user()
    if not user:
      return

    if path == "/api/dashboard":
      self._json_response(HTTPStatus.OK, storage.dashboard_payload(user["username"]))
      return

    if path == "/api/content/site":
      self._json_response(HTTPStatus.OK, {"content": storage.read_site_content()})
      return

    if path == "/api/content/blog":
      self._json_response(HTTPStatus.OK, {"content": storage.read_blog_data()})
      return

    if path == "/api/media":
      self._json_response(HTTPStatus.OK, {"items": storage.list_media()})
      return

    if path == "/api/audit":
      events = db.list_audit_events(40)
      # Convert datetime objects to strings for JSON serialization
      for event in events:
        if "created_at" in event and hasattr(event["created_at"], "isoformat"):
          event["created_at"] = event["created_at"].isoformat()
      self._json_response(HTTPStatus.OK, {"events": events})
      return

    if path == "/api/affiliations":
      affiliations = db.list_affiliations()
      self._json_response(HTTPStatus.OK, {"affiliations": affiliations})
      return

    if path == "/api/research-interests":
      interests = db.list_research_interests(published_only=False)
      self._json_response(HTTPStatus.OK, {"research_interests": interests})
      return

    if path == "/api/awards":
      awards = db.list_awards(published_only=False)
      self._json_response(HTTPStatus.OK, {"awards": awards})
      return

    if path == "/api/external-profiles":
      profiles = db.list_external_profiles(published_only=False)
      self._json_response(HTTPStatus.OK, {"external_profiles": profiles})
      return

    if path == "/api/collaborators":
      collaborators = db.list_collaborators(published_only=False)
      self._json_response(HTTPStatus.OK, {"collaborators": collaborators})
      return

    if path == "/api/hero":
      hero = db.get_hero_content()
      self._json_response(HTTPStatus.OK, {"hero": hero})
      return

    if path == "/api/statistics":
      stats = db.list_statistics(published_only=False)
      self._json_response(HTTPStatus.OK, {"statistics": stats})
      return

    if path == "/api/services":
      services = db.list_services(published_only=False)
      self._json_response(HTTPStatus.OK, {"services": services})
      return

    self._json_response(HTTPStatus.NOT_FOUND, {"error": "Route not found"})

  def do_POST(self) -> None:
    path = urlparse(self.path).path

    if path == "/api/auth/signin":
      try:
        payload = self._read_json_body()
      except json.JSONDecodeError:
        self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Invalid JSON payload"})
        return

      email = str(payload.get("email", "")).strip()
      password = str(payload.get("password", ""))

      # Try to find user by email (for regular users)
      user = db.get_user_by_email(email)
      if not user:
        self._json_response(HTTPStatus.UNAUTHORIZED, {"error": "Invalid email or password"})
        return

      # Verify password
      if not db.verify_user_password(user["id"], password):
        self._json_response(HTTPStatus.UNAUTHORIZED, {"error": "Invalid email or password"})
        return

      session_token = generate_session_token()
      session_created = db.create_session(
        user_id=user["id"],
        token=session_token,
        ip_address=self.client_address[0],
        user_agent=self.headers.get("User-Agent", "unknown"),
        expires_hours=config.DEFAULT_SESSION_HOURS,
      )
      
      if not session_created:
        self._json_response(HTTPStatus.INTERNAL_SERVER_ERROR, {"error": "Failed to create session"})
        return

      self._json_response(HTTPStatus.OK, {
        "token": session_token,
        "user": {
          "email": user.get("email"),
          "name": user.get("display_name", user.get("username")),
          "role": user.get("role", "user"),
        }
      })
      return

    if path == "/api/auth/login":
      try:
        payload = self._read_json_body()
      except json.JSONDecodeError:
        self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Invalid JSON payload"})
        return

      username = str(payload.get("username", "")).strip()
      password = str(payload.get("password", ""))
      otp = str(payload.get("otp", "")).strip()

      user = db.verify_user_credentials(username, password)
      if not user:
        self._json_response(HTTPStatus.UNAUTHORIZED, {"error": "Invalid username or password"})
        return

      if config.DEFAULT_ADMIN_TOTP_SECRET and not verify_totp(config.DEFAULT_ADMIN_TOTP_SECRET, otp):
        self._json_response(HTTPStatus.UNAUTHORIZED, {"error": "Invalid one-time authentication code"})
        return

      session_token = generate_session_token()
      session_created = db.create_session(
        user_id=user["id"],
        token=session_token,
        ip_address=self.client_address[0],
        user_agent=self.headers.get("User-Agent", "unknown"),
        expires_hours=config.DEFAULT_SESSION_HOURS,
      )
      
      if not session_created:
        self._json_response(HTTPStatus.INTERNAL_SERVER_ERROR, {"error": "Failed to create session"})
        return

      self.send_response(HTTPStatus.OK)
      self._set_session_cookie(session_token, max_age=config.DEFAULT_SESSION_HOURS * 60 * 60)
      self.send_header("Content-Type", "application/json; charset=utf-8")
      body = json.dumps(
        {
          "authenticated": True,
          "user": {
            "username": user["username"],
            "displayName": user["display_name"],
            "role": user["role"],
            "mfaConfigured": bool(config.DEFAULT_ADMIN_TOTP_SECRET),
            "phoneNumber": user.get("phone_number") or "",
            "email": user.get("email") or "",
          },
        }
      ).encode("utf-8")
      self.send_header("Content-Length", str(len(body)))
      self.end_headers()
      self.wfile.write(body)
      return

    user = self._require_user()
    if not user:
      return

    if path == "/api/auth/logout":
      token = self._get_session_token()
      if token:
        db.destroy_session(token)
      db.append_audit_event(
        action="auth.logout",
        actor=user["username"],
        summary="Admin logout completed",
        user_id=user["session"]["user_id"] if user.get("session") else None,
      )
      self.send_response(HTTPStatus.OK)
      self._set_session_cookie("", max_age=0)
      self.send_header("Content-Type", "application/json; charset=utf-8")
      body = b'{"authenticated": false}'
      self.send_header("Content-Length", str(len(body)))
      self.end_headers()
      self.wfile.write(body)
      return

    if path == "/api/user/phone":
      try:
        payload = self._read_json_body()
      except json.JSONDecodeError:
        self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Invalid JSON payload"})
        return

      phone_number = str(payload.get("phoneNumber", "")).strip()
      
      # Get user ID from session
      user_data = db.get_user_by_username(user["username"])
      if not user_data:
        self._json_response(HTTPStatus.NOT_FOUND, {"error": "User not found"})
        return

      success = db.update_user_phone_number(user_data["id"], phone_number)
      if success:
        self._json_response(HTTPStatus.OK, {"success": True, "phoneNumber": phone_number})
      else:
        self._json_response(HTTPStatus.INTERNAL_SERVER_ERROR, {"error": "Failed to update phone number"})
      return

    if path == "/api/user/email":
      try:
        payload = self._read_json_body()
      except json.JSONDecodeError:
        self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Invalid JSON payload"})
        return

      email = str(payload.get("email", "")).strip()
      
      # Get user ID from session
      user_data = db.get_user_by_username(user["username"])
      if not user_data:
        self._json_response(HTTPStatus.NOT_FOUND, {"error": "User not found"})
        return

      success = db.update_user_email(user_data["id"], email)
      if success:
        self._json_response(HTTPStatus.OK, {"success": True, "email": email})
      else:
        self._json_response(HTTPStatus.INTERNAL_SERVER_ERROR, {"error": "Failed to update email"})
      return

    if path == "/api/user/display-name":
      try:
        payload = self._read_json_body()
      except json.JSONDecodeError:
        self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Invalid JSON payload"})
        return

      display_name = str(payload.get("displayName", "")).strip()
      
      # Get user ID from session
      user_data = db.get_user_by_username(user["username"])
      if not user_data:
        self._json_response(HTTPStatus.NOT_FOUND, {"error": "User not found"})
        return

      success = db.update_user_display_name(user_data["id"], display_name)
      if success:
        self._json_response(HTTPStatus.OK, {"success": True, "displayName": display_name})
      else:
        self._json_response(HTTPStatus.INTERNAL_SERVER_ERROR, {"error": "Failed to update display name"})
      return

    if path == "/api/media":
      content_length = int(self.headers.get("Content-Length", "0"))
      if content_length <= 0 or content_length > MAX_UPLOAD_BYTES:
        self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Upload is empty or exceeds the 10MB limit"})
        return

      form = cgi.FieldStorage(
        fp=self.rfile,
        headers=self.headers,
        environ={
          "REQUEST_METHOD": "POST",
          "CONTENT_TYPE": self.headers.get("Content-Type", ""),
        },
      )

      if "file" not in form:
        self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Missing file field"})
        return

      file_field = form["file"]
      file_name = getattr(file_field, "filename", "") or ""
      content_type = getattr(file_field, "type", "") or ""
      file_bytes = file_field.file.read() if getattr(file_field, "file", None) else b""

      if not file_name or not file_bytes:
        self._json_response(HTTPStatus.BAD_REQUEST, {"error": "No file selected"})
        return

      if content_type not in ALLOWED_UPLOAD_TYPES:
        self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Unsupported file type"})
        return

      item = storage.save_media_upload(
        file_name=file_name,
        file_bytes=file_bytes,
        content_type=content_type,
        actor=user["username"],
      )
      self._json_response(HTTPStatus.CREATED, {"item": item})
      return

    if path == "/api/research-interests":
      try:
        payload = self._read_json_body()
        required = ['title', 'icon', 'color']
        for field in required:
          if field not in payload:
            self._json_response(HTTPStatus.BAD_REQUEST, {"error": f"Missing required field: {field}"})
            return

        interest = db.create_research_interest(
          title=payload['title'],
          description=payload.get('description'),
          icon=payload['icon'],
          color=payload['color'],
          display_order=payload.get('display_order', 0),
          published=payload.get('published', True)
        )
        self._json_response(HTTPStatus.CREATED, interest)
        return
      except Exception as e:
        self._json_response(HTTPStatus.INTERNAL_SERVER_ERROR, {"error": str(e)})
        return

    if path == "/api/awards":
      try:
        payload = self._read_json_body()
        required = ['title', 'year', 'icon', 'color']
        for field in required:
          if field not in payload:
            self._json_response(HTTPStatus.BAD_REQUEST, {"error": f"Missing required field: {field}"})
            return

        award = db.create_award(
          title=payload['title'],
          year=payload['year'],
          description=payload.get('description'),
          organization=payload.get('organization'),
          url=payload.get('url'),
          image_url=payload.get('image_url'),
          icon=payload['icon'],
          color=payload['color'],
          display_order=payload.get('display_order', 0),
          published=payload.get('published', True)
        )
        self._json_response(HTTPStatus.CREATED, award)
        return
      except Exception as e:
        self._json_response(HTTPStatus.INTERNAL_SERVER_ERROR, {"error": str(e)})
        return

    if path == "/api/external-profiles":
      try:
        payload = self._read_json_body()
        required = ['label', 'description', 'url', 'platform', 'icon', 'color']
        for field in required:
          if field not in payload:
            self._json_response(HTTPStatus.BAD_REQUEST, {"error": f"Missing required field: {field}"})
            return

        profile = db.create_external_profile(
          label=payload['label'],
          description=payload['description'],
          url=payload['url'],
          platform=payload['platform'],
          icon=payload['icon'],
          color=payload['color'],
          metrics=payload.get('metrics'),
          display_order=payload.get('display_order', 0),
          published=payload.get('published', True)
        )
        self._json_response(HTTPStatus.CREATED, profile)
        return
      except Exception as e:
        self._json_response(HTTPStatus.INTERNAL_SERVER_ERROR, {"error": str(e)})
        return

    if path == "/api/collaborators":
      try:
        payload = self._read_json_body()
        required = ['name', 'title', 'role', 'testimonial']
        for field in required:
          if field not in payload:
            self._json_response(HTTPStatus.BAD_REQUEST, {"error": f"Missing required field: {field}"})
            return

        collaborator = db.create_collaborator(
          name=payload['name'],
          title=payload['title'],
          role=payload['role'],
          testimonial=payload['testimonial'],
          display_order=payload.get('display_order', 0),
          published=payload.get('published', True)
        )
        self._json_response(HTTPStatus.CREATED, collaborator)
        return
      except Exception as e:
        self._json_response(HTTPStatus.INTERNAL_SERVER_ERROR, {"error": str(e)})
        return

    if path == "/api/hero":
      try:
        payload = self._read_json_body()
        required = ['eyebrow', 'headline']
        for field in required:
          if field not in payload:
            self._json_response(HTTPStatus.BAD_REQUEST, {"error": f"Missing required field: {field}"})
            return

        hero = db.create_hero_content(
          eyebrow=payload['eyebrow'],
          headline=payload['headline'],
          description=payload.get('description'),
          badges=payload.get('badges'),
          background_image_url=payload.get('background_image_url'),
          cta_text=payload.get('cta_text'),
          cta_url=payload.get('cta_url'),
          published=payload.get('published', True)
        )
        self._json_response(HTTPStatus.CREATED, hero)
        return
      except Exception as e:
        self._json_response(HTTPStatus.INTERNAL_SERVER_ERROR, {"error": str(e)})
        return

    if path == "/api/statistics":
      try:
        payload = self._read_json_body()
        required = ['label', 'value']
        for field in required:
          if field not in payload:
            self._json_response(HTTPStatus.BAD_REQUEST, {"error": f"Missing required field: {field}"})
            return

        stat = db.create_statistic(
          label=payload['label'],
          value=payload['value'],
          suffix=payload.get('suffix'),
          icon=payload.get('icon'),
          display_order=payload.get('display_order', 0),
          published=payload.get('published', True)
        )
        self._json_response(HTTPStatus.CREATED, stat)
        return
      except Exception as e:
        self._json_response(HTTPStatus.INTERNAL_SERVER_ERROR, {"error": str(e)})
        return

    if path == "/api/services":
      try:
        payload = self._read_json_body()
        required = ['title', 'icon']
        for field in required:
          if field not in payload:
            self._json_response(HTTPStatus.BAD_REQUEST, {"error": f"Missing required field: {field}"})
            return

        service = db.create_service(
          title=payload['title'],
          icon=payload['icon'],
          description=payload.get('description'),
          bullets=payload.get('bullets'),
          display_order=payload.get('display_order', 0),
          published=payload.get('published', True)
        )
        self._json_response(HTTPStatus.CREATED, service)
        return
      except Exception as e:
        self._json_response(HTTPStatus.INTERNAL_SERVER_ERROR, {"error": str(e)})
        return

    # Content Management API endpoints
    if path == "/api/content":
      if self.command == "GET":
        # List content
        content_type = self._get_query_param("type")
        status = self._get_query_param("status")
        limit = int(self._get_query_param("limit", "50"))
        offset = int(self._get_query_param("offset", "0"))
        
        content_list = db.list_content(
          content_type=content_type if content_type else None,
          status=status if status else None,
          limit=limit,
          offset=offset
        )
        self._json_response(HTTPStatus.OK, {"content": content_list})
        return
        
      elif self.command == "POST":
        # Create content
        try:
          payload = self._read_json_body()
          required_fields = ["title", "content"]
          if not all(field in payload for field in required_fields):
            self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Missing required fields"})
            return
          
          content_data = db.create_content(
            title=payload["title"],
            content=payload["content"],
            content_type=payload.get("type", "page"),
            status=payload.get("status", "draft"),
            category=payload.get("category"),
            tags=payload.get("tags"),
            seo_title=payload.get("seo_title"),
            seo_description=payload.get("seo_description"),
            author_id=user["id"],
            metadata=payload.get("metadata")
          )
          self._json_response(HTTPStatus.CREATED, {"content": content_data})
          return
        except Exception as e:
          self._json_response(HTTPStatus.INTERNAL_SERVER_ERROR, {"error": str(e)})
          return
        
      elif self.command == "PUT":
        # Update content
        try:
          content_id = self._get_query_param("id")
          if not content_id:
            self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Content ID required"})
            return
          
          payload = self._read_json_body()
          success = db.update_content(int(content_id), **payload)
          
          if success:
            updated_content = db.get_content_by_id(int(content_id))
            self._json_response(HTTPStatus.OK, {"content": updated_content})
          else:
            self._json_response(HTTPStatus.NOT_FOUND, {"error": "Content not found"})
          return
        except Exception as e:
          self._json_response(HTTPStatus.INTERNAL_SERVER_ERROR, {"error": str(e)})
          return
        
      elif self.command == "DELETE":
        # Delete content
        content_id = self._get_query_param("id")
        if not content_id:
          self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Content ID required"})
          return
        
        success = db.delete_content(int(content_id))
        if success:
          self._json_response(HTTPStatus.OK, {"deleted": True})
        else:
          self._json_response(HTTPStatus.NOT_FOUND, {"error": "Content not found"})
        return

    # Media Management API endpoints
    if path == "/api/media":
      if self.command == "GET":
        # List media
        media_type = self._get_query_param("type")
        limit = int(self._get_query_param("limit", "50"))
        offset = int(self._get_query_param("offset", "0"))
        
        media_list = db.list_media(
          media_type=media_type if media_type else None,
          limit=limit,
          offset=offset
        )
        self._json_response(HTTPStatus.OK, {"media": media_list})
        return
        
      elif self.command == "POST":
        # Create media record
        try:
          payload = self._read_json_body()
          required_fields = ["filename", "original_filename", "type", "size", "url"]
          if not all(field in payload for field in required_fields):
            self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Missing required fields"})
            return
          
          media_data = db.create_media(
            filename=payload["filename"],
            original_filename=payload["original_filename"],
            media_type=payload["type"],
            size=payload["size"],
            url=payload["url"],
            thumbnail_url=payload.get("thumbnail_url"),
            uploaded_by=user["id"],
            tags=payload.get("tags"),
            metadata=payload.get("metadata")
          )
          self._json_response(HTTPStatus.CREATED, {"media": media_data})
          return
        except Exception as e:
          self._json_response(HTTPStatus.INTERNAL_SERVER_ERROR, {"error": str(e)})
          return
        
      elif self.command == "DELETE":
        # Delete media
        media_id = self._get_query_param("id")
        if not media_id:
          self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Media ID required"})
          return
        
        success = db.delete_media(int(media_id))
        if success:
          self._json_response(HTTPStatus.OK, {"deleted": True})
        else:
          self._json_response(HTTPStatus.NOT_FOUND, {"error": "Media not found"})
        return

    # Content by ID endpoint
    if path.startswith("/api/content/") and self.command == "GET":
      try:
        content_id = int(path.split("/")[-1])
        content = db.get_content_by_id(content_id)
        if content:
          self._json_response(HTTPStatus.OK, {"content": content})
        else:
          self._json_response(HTTPStatus.NOT_FOUND, {"error": "Content not found"})
        return
      except ValueError:
        self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Invalid content ID"})
        return

    # Home Page Content API endpoints
    if path == "/api/home-page-content":
      if self.command == "GET":
        # Get home page content
        section = self._get_query_param("section")
        content_data = db.get_home_page_content(section if section else None)
        self._json_response(HTTPStatus.OK, {"content": content_data})
        return
        
      elif self.command == "POST":
        # Update home page content
        try:
          payload = self._read_json_body()
          required_fields = ["section", "field", "value"]
          if not all(field in payload for field in required_fields):
            self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Missing required fields"})
            return
          
          success = db.update_home_page_content(
            section=payload["section"],
            field=payload["field"],
            value=payload["value"],
            updated_by=user["id"]
          )
          
          if success:
            self._json_response(HTTPStatus.OK, {"updated": True})
          else:
            self._json_response(HTTPStatus.INTERNAL_SERVER_ERROR, {"error": "Failed to update content"})
          return
        except Exception as e:
          self._json_response(HTTPStatus.INTERNAL_SERVER_ERROR, {"error": str(e)})
          return
        
      elif self.command == "DELETE":
        # Delete home page content
        section = self._get_query_param("section")
        field = self._get_query_param("field")
        
        if not section:
          self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Section parameter required"})
          return
        
        success = db.delete_home_page_content(section, field if field else None)
        if success:
          self._json_response(HTTPStatus.OK, {"deleted": True})
        else:
          self._json_response(HTTPStatus.NOT_FOUND, {"error": "Content not found"})
        return

    # Home page content by section endpoint
    if path.startswith("/api/home-page-content/") and self.command == "GET":
      try:
        section = path.split("/")[-1]
        content_data = db.get_home_page_content(section)
        if content_data:
          self._json_response(HTTPStatus.OK, {"content": content_data})
        else:
          self._json_response(HTTPStatus.NOT_FOUND, {"error": "Section not found"})
        return
      except Exception as e:
        self._json_response(HTTPStatus.INTERNAL_SERVER_ERROR, {"error": str(e)})
        return

    # Media by ID endpoint
    if path.startswith("/api/media/") and self.command == "GET":
      try:
        media_id = int(path.split("/")[-1])
        media = db.get_media_by_id(media_id)
        if media:
          self._json_response(HTTPStatus.OK, {"media": media})
        else:
          self._json_response(HTTPStatus.NOT_FOUND, {"error": "Media not found"})
        return
      except ValueError:
        self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Invalid media ID"})
        return

    self._json_response(HTTPStatus.NOT_FOUND, {"error": "Route not found"})

  def do_PUT(self) -> None:
    path = urlparse(self.path).path
    user = self._require_user()
    if not user:
      return

    try:
      payload = self._read_json_body()
    except json.JSONDecodeError:
      self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Invalid JSON payload"})
      return

    if path == "/api/content/site":
      if "hero" not in payload or "services" not in payload or "contact" not in payload:
        self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Incomplete site content payload"})
        return
      storage.write_site_content(payload, actor=user["username"])
      self._json_response(HTTPStatus.OK, {"saved": True})
      return

    if path == "/api/content/blog":
      if "blogPosts" not in payload or "blogContentBySlug" not in payload:
        self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Incomplete blog payload"})
        return
      storage.write_blog_data(payload, actor=user["username"])
      self._json_response(HTTPStatus.OK, {"saved": True})
      return

    if path == "/api/affiliations":
      affiliation_id = self._get_query_param("id")
      if not affiliation_id:
        self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Affiliation ID required"})
        return

      # Convert camelCase to snake_case for database
      db_payload = {}
      field_mapping = {
        "name": "name",
        "role": "role",
        "shortDescription": "short_description",
        "detailedDescription": "detailed_description",
        "url": "url",
        "icon": "icon",
        "color": "color",
        "displayOrder": "display_order",
        "published": "published"
      }

      for camel_key, snake_key in field_mapping.items():
        if camel_key in payload:
          db_payload[snake_key] = payload[camel_key]

      success = db.update_affiliation(int(affiliation_id), **db_payload)
      if success:
        updated = db.get_affiliation_by_id(int(affiliation_id))
        self._json_response(HTTPStatus.OK, {"affiliation": updated})
      else:
        self._json_response(HTTPStatus.NOT_FOUND, {"error": "Affiliation not found"})
      return

    if path == "/api/research-interests":
      if 'id' not in payload:
        self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Missing id"})
        return

      success = db.update_research_interest(payload['id'], **{k: v for k, v in payload.items() if k != 'id'})
      if success:
        interest = db.get_research_interest_by_id(payload['id'])
        self._json_response(HTTPStatus.OK, interest)
      else:
        self._json_response(HTTPStatus.NOT_FOUND, {"error": "Research interest not found"})
      return

    if path == "/api/awards":
      if 'id' not in payload:
        self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Missing id"})
        return

      success = db.update_award(payload['id'], **{k: v for k, v in payload.items() if k != 'id'})
      if success:
        award = db.get_award_by_id(payload['id'])
        self._json_response(HTTPStatus.OK, award)
      else:
        self._json_response(HTTPStatus.NOT_FOUND, {"error": "Award not found"})
      return

    if path == "/api/external-profiles":
      if 'id' not in payload:
        self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Missing id"})
        return

      success = db.update_external_profile(payload['id'], **{k: v for k, v in payload.items() if k != 'id'})
      if success:
        profile = db.get_external_profile_by_id(payload['id'])
        self._json_response(HTTPStatus.OK, profile)
      else:
        self._json_response(HTTPStatus.NOT_FOUND, {"error": "External profile not found"})
      return

    if path == "/api/collaborators":
      if 'id' not in payload:
        self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Missing id"})
        return

      success = db.update_collaborator(payload['id'], **{k: v for k, v in payload.items() if k != 'id'})
      if success:
        collaborator = db.get_collaborator_by_id(payload['id'])
        self._json_response(HTTPStatus.OK, collaborator)
      else:
        self._json_response(HTTPStatus.NOT_FOUND, {"error": "Collaborator not found"})
      return

    if path == "/api/hero":
      if 'id' not in payload:
        self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Missing id"})
        return

      success = db.update_hero_content(payload['id'], **{k: v for k, v in payload.items() if k != 'id'})
      if success:
        hero = db.get_hero_content_by_id(payload['id'])
        self._json_response(HTTPStatus.OK, hero)
      else:
        self._json_response(HTTPStatus.NOT_FOUND, {"error": "Hero content not found"})
      return

    if path == "/api/statistics":
      if 'id' not in payload:
        self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Missing id"})
        return

      success = db.update_statistic(payload['id'], **{k: v for k, v in payload.items() if k != 'id'})
      if success:
        stat = db.get_statistic_by_id(payload['id'])
        self._json_response(HTTPStatus.OK, stat)
      else:
        self._json_response(HTTPStatus.NOT_FOUND, {"error": "Statistic not found"})
      return

    if path == "/api/services":
      if 'id' not in payload:
        self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Missing id"})
        return

      success = db.update_service(payload['id'], **{k: v for k, v in payload.items() if k != 'id'})
      if success:
        service = db.get_service_by_id(payload['id'])
        self._json_response(HTTPStatus.OK, service)
      else:
        self._json_response(HTTPStatus.NOT_FOUND, {"error": "Service not found"})
      return

    if path == "/api/user/username":
      if 'username' not in payload:
        self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Missing username"})
        return

      success = db.update_user_username(user['id'], payload['username'])
      if success:
        self._json_response(HTTPStatus.OK, {"updated": True})
      else:
        self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Username already exists or update failed"})
      return

    if path == "/api/user/password":
      if 'currentPassword' not in payload or 'newPassword' not in payload:
        self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Missing currentPassword or newPassword"})
        return

      # Verify current password
      from security import verify_password
      if not verify_password(payload['currentPassword'], user['password_hash']):
        self._json_response(HTTPStatus.UNAUTHORIZED, {"error": "Current password is incorrect"})
        return

      # Update password
      success = db.update_user_password(user['id'], payload['newPassword'])
      if success:
        self._json_response(HTTPStatus.OK, {"updated": True})
      else:
        self._json_response(HTTPStatus.INTERNAL_SERVER_ERROR, {"error": "Failed to update password"})
      return

    self._json_response(HTTPStatus.NOT_FOUND, {"error": "Route not found"})

  def do_DELETE(self) -> None:
    path = urlparse(self.path).path
    user = self._require_user()
    if not user:
      return

    if path == "/api/affiliations":
      affiliation_id = self._get_query_param("id")
      if not affiliation_id:
        self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Affiliation ID required"})
        return

      success = db.delete_affiliation(int(affiliation_id))
      if success:
        self._json_response(HTTPStatus.OK, {"deleted": True})
      else:
        self._json_response(HTTPStatus.NOT_FOUND, {"error": "Affiliation not found"})
      return

    if path == "/api/research-interests":
      research_id = self._get_query_param("id")
      if not research_id:
        self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Research interest ID required"})
        return

      success = db.delete_research_interest(int(research_id))
      if success:
        self._json_response(HTTPStatus.OK, {"deleted": True})
      else:
        self._json_response(HTTPStatus.NOT_FOUND, {"error": "Research interest not found"})
      return

    if path == "/api/awards":
      award_id = self._get_query_param("id")
      if not award_id:
        self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Award ID required"})
        return

      success = db.delete_award(int(award_id))
      if success:
        self._json_response(HTTPStatus.OK, {"deleted": True})
      else:
        self._json_response(HTTPStatus.NOT_FOUND, {"error": "Award not found"})
      return

    if path == "/api/external-profiles":
      profile_id = self._get_query_param("id")
      if not profile_id:
        self._json_response(HTTPStatus.BAD_REQUEST, {"error": "External profile ID required"})
        return

      success = db.delete_external_profile(int(profile_id))
      if success:
        self._json_response(HTTPStatus.OK, {"deleted": True})
      else:
        self._json_response(HTTPStatus.NOT_FOUND, {"error": "External profile not found"})
      return

    if path == "/api/collaborators":
      collaborator_id = self._get_query_param("id")
      if not collaborator_id:
        self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Collaborator ID required"})
        return

      success = db.delete_collaborator(int(collaborator_id))
      if success:
        self._json_response(HTTPStatus.OK, {"deleted": True})
      else:
        self._json_response(HTTPStatus.NOT_FOUND, {"error": "Collaborator not found"})
      return

    if path == "/api/hero":
      hero_id = self._get_query_param("id")
      if not hero_id:
        self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Hero ID required"})
        return

      success = db.delete_hero_content(int(hero_id))
      if success:
        self._json_response(HTTPStatus.OK, {"deleted": True})
      else:
        self._json_response(HTTPStatus.NOT_FOUND, {"error": "Hero content not found"})
      return

    if path == "/api/statistics":
      stat_id = self._get_query_param("id")
      if not stat_id:
        self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Statistic ID required"})
        return

      success = db.delete_statistic(int(stat_id))
      if success:
        self._json_response(HTTPStatus.OK, {"deleted": True})
      else:
        self._json_response(HTTPStatus.NOT_FOUND, {"error": "Statistic not found"})
      return

    if path == "/api/services":
      service_id = self._get_query_param("id")
      if not service_id:
        self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Service ID required"})
        return

      success = db.delete_service(int(service_id))
      if success:
        self._json_response(HTTPStatus.OK, {"deleted": True})
      else:
        self._json_response(HTTPStatus.NOT_FOUND, {"error": "Service not found"})
      return

    self._json_response(HTTPStatus.NOT_FOUND, {"error": "Route not found"})


def create_default_admin_user() -> None:
  """Create default admin user if not exists"""
  try:
    existing = db.get_user_by_username(config.DEFAULT_ADMIN_USERNAME)
    if existing:
      return
    
    db.create_user(
      username=config.DEFAULT_ADMIN_USERNAME,
      password=config.DEFAULT_ADMIN_PASSWORD,
      display_name=config.DEFAULT_ADMIN_NAME,
      role="super_admin"
    )
    print(f"✅ Created default admin user: {config.DEFAULT_ADMIN_USERNAME}")
  except Exception as e:
    print(f"⚠️  Failed to create default admin user: {e}")


def main() -> None:
  storage.ensure_storage()
  create_default_admin_user()
  server = ThreadingHTTPServer(("0.0.0.0", config.PORT), AdminRequestHandler)
  print(f"Admin API listening on http://localhost:{config.PORT}")
  print(f"Allowed frontend origin: {config.DEFAULT_ALLOWED_ORIGIN}")
  print(f"Default admin credentials: {config.DEFAULT_ADMIN_USERNAME} / {config.DEFAULT_ADMIN_PASSWORD}")
  server.serve_forever()


if __name__ == "__main__":
  main()

