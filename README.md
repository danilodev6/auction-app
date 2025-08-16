# Auction App

**A real-time auction web application with live bidding, chat, and admin management dashboard.**

---

## Overview

This project is a web application that allows users to participate in live auctions with real-time updates for bids and chat messages. An admin can manage auction items, control availability, and block/unblock users from participating.  

The app provides an interactive experience with seamless synchronization between users through **Pusher** and **Supabase**.

---

## Features

- 🔑 **Authentication** with Google (Supabase Auth)  
- 🛠️ **Admin Dashboard** to manage items and users  
- 📡 **Real-time bidding and chat** powered by Pusher  
- 📦 **Item data** persisted with Drizzle ORM and Supabase  
- 📷 **Images** stored in a free Supabase bucket  
- 🚫 **User management**: block/unblock users  
- 🎯 **Conditional rendering** for admin and user roles  

---

## Frontend

- Built with **Next.js 13+ (App Router)**.  
- **Pusher** for real-time communication (bids + chat).  
- **Supabase** for authentication and user/session management.  
- **Drizzle ORM** for database integration.  
- **TailwindCSS** for styling.  

---

## Installation

### Clone the repository

```bash
git clone <repo-url>
cd auction-app

-- bun Installation
bun install
bun dev
